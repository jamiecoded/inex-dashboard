"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { BarChart } from "@/components/BarChart";
import { DonutChart } from "@/components/DonutChart";
import { RecentTable } from "@/components/RecentTable";
import { useAppContext } from "@/context/AppContext";
import { useMemo } from "react";

export default function Home() {
  const { state } = useAppContext();
  const { transactions } = state;

  const now = new Date();

  const currentMonthTxns = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions]
  );

  const totalIncome = useMemo(
    () =>
      currentMonthTxns
        .filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0),
    [currentMonthTxns]
  );

  const totalExpenses = useMemo(
    () =>
      currentMonthTxns
        .filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0),
    [currentMonthTxns]
  );

  const totalBalance = useMemo(
    () =>
      transactions.reduce(
        (sum, t) => (t.type === "credit" ? sum + t.amount : sum - t.amount),
        0
      ),
    [transactions]
  );

  const lastMonthExpenses = useMemo(() => {
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === "debit" &&
          d.getMonth() === lastMonth &&
          d.getFullYear() === lastYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  const expenseDelta = useMemo(() => {
    if (lastMonthExpenses === 0) return 0;
    return Math.round(
      ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    );
  }, [totalExpenses, lastMonthExpenses]);

  return (
    <div className="flex min-h-[100svh] w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full relative">
        <Navbar />
        <main className="flex-1 px-[clamp(1rem,3vw,2.5rem)] pb-20 mt-20 md:mt-4 max-w-[1280px] mx-auto w-full">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12 relative"
          >
            <div className="absolute -top-20 left-40 w-64 h-64 bg-accent opacity-[0.03] blur-[100px] pointer-events-none" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Good morning,
              <br />
              Jay
            </h1>
            <p className="text-muted tracking-wide text-sm md:text-base">
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </motion.header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(1rem,2vw,1.5rem)] mb-6">
            <StatCard
              title="TOTAL BALANCE"
              value={totalBalance}
              subtext="ALL TIME"
              variant="accent"
              trendUp={totalBalance >= 0}
            />
            <StatCard
              title="INCOME"
              value={totalIncome}
              subtext="THIS MONTH"
              variant="light"
              trendUp={true}
            />
            <StatCard
              title="EXPENSES"
              value={totalExpenses}
              subtext={
                expenseDelta === 0
                  ? "THIS MONTH"
                  : `${expenseDelta > 0 ? "▲" : "▼"} ${Math.abs(expenseDelta)}% VS LAST MONTH`
              }
              variant="dark"
              trendUp={expenseDelta <= 0}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[clamp(1rem,2vw,1.5rem)] mb-6">
            <BarChart />
            <DonutChart />
          </div>

          <RecentTable />
        </main>
      </div>
    </div>
  );
}
