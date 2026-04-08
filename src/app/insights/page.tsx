"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { InsightCard } from "@/components/insights/InsightCard";
import { MonthlyComparisonChart } from "@/components/insights/MonthlyComparisonChart";
import { CategoryBreakdown } from "@/components/insights/CategoryBreakdown";
import { SpendingTrendChart } from "@/components/insights/SpendingTrendChart";
import { ObservationCard } from "@/components/insights/ObservationCard";
import { TopMerchantsTable, MerchantSummary } from "@/components/insights/TopMerchantsTable";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "thisMonth" | "last3Months" | "thisYear";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Housing:   "#2ec4b6",
  Food:      "#4ade80",
  Transport: "#f87171",
  Income:    "#a78bfa",
  Utilities: "#fb923c",
  Other:     "#9ca3af",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

const PERIOD_LABELS: Record<Period, string> = {
  thisMonth:    "This month",
  last3Months:  "Last 3 months",
  thisYear:     "This year",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const { state } = useAppContext();
  const { transactions } = state;

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("thisMonth");

  // ── Period filter ────────────────────────────────────────────────────────
  const periodTxns = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (selectedPeriod === "thisMonth") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (selectedPeriod === "last3Months") {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 3);
        return d >= cutoff;
      }
      if (selectedPeriod === "thisYear") {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, selectedPeriod]);

  // ── Previous period (for comparison deltas) ──────────────────────────────
  const lastPeriodTxns = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (selectedPeriod === "thisMonth") {
        const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return d.getMonth() === lm && d.getFullYear() === ly;
      }
      if (selectedPeriod === "last3Months") {
        const sixAgo = new Date(); sixAgo.setMonth(sixAgo.getMonth() - 6);
        const threeAgo = new Date(); threeAgo.setMonth(threeAgo.getMonth() - 3);
        return d >= sixAgo && d < threeAgo;
      }
      if (selectedPeriod === "thisYear") {
        return d.getFullYear() === now.getFullYear() - 1;
      }
      return false;
    });
  }, [transactions, selectedPeriod]);

  // ── Core aggregates ──────────────────────────────────────────────────────
  const debitsByCategory = useMemo(
    () =>
      periodTxns
        .filter((t) => t.type === "debit")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] ?? 0) + t.amount;
          return acc;
        }, {} as Record<string, number>),
    [periodTxns]
  );

  const totalDebits = useMemo(
    () => Object.values(debitsByCategory).reduce((s, v) => s + v, 0),
    [debitsByCategory]
  );

  const periodIncome = useMemo(
    () => periodTxns.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0),
    [periodTxns]
  );

  const periodExpenses = totalDebits;

  const savingsRate = useMemo(
    () =>
      periodIncome > 0
        ? Math.min(100, Math.max(0, Math.round(((periodIncome - periodExpenses) / periodIncome) * 100)))
        : 0,
    [periodIncome, periodExpenses]
  );

  const daysInPeriod = useMemo(() => {
    if (selectedPeriod === "thisMonth") return new Date().getDate();
    if (selectedPeriod === "last3Months") return 90;
    if (selectedPeriod === "thisYear") {
      const start = new Date(new Date().getFullYear(), 0, 1);
      return Math.max(1, Math.ceil((Date.now() - start.getTime()) / 86_400_000));
    }
    return 30;
  }, [selectedPeriod]);

  const avgDailySpend = daysInPeriod > 0 ? Math.round(periodExpenses / daysInPeriod) : 0;

  const lastPeriodExpenses = useMemo(
    () => lastPeriodTxns.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0),
    [lastPeriodTxns]
  );

  const prevAvgDailySpend = lastPeriodExpenses > 0 ? Math.round(lastPeriodExpenses / daysInPeriod) : 0;

  // ── Card 1: Top category ─────────────────────────────────────────────────
  const topCategory = useMemo(() => {
    const entries = Object.entries(debitsByCategory).sort((a, b) => b[1] - a[1]);
    return entries[0] ?? null;
  }, [debitsByCategory]);

  const topCategoryPct = topCategory && totalDebits > 0
    ? Math.round((topCategory[1] / totalDebits) * 100)
    : 0;

  const lastTopCategory = useMemo(() => {
    const lp = lastPeriodTxns
      .filter((t) => t.type === "debit")
      .reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc; }, {} as Record<string, number>);
    return Object.entries(lp).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [lastPeriodTxns]);

  // ── 3-month average by category (for anomaly detection) ──────────────────
  const avgByCategory = useMemo(() => {
    const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 3);
    const txns = transactions.filter((t) => new Date(t.date) >= cutoff && t.type === "debit");
    const totals: Record<string, number> = {};
    const monthSets: Record<string, Set<string>> = {};
    txns.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthSets[t.category]) monthSets[t.category] = new Set();
      monthSets[t.category].add(key);
      totals[t.category] = (totals[t.category] ?? 0) + t.amount;
    });
    const result: Record<string, number> = {};
    Object.entries(totals).forEach(([cat, total]) => {
      result[cat] = total / Math.max(1, monthSets[cat]?.size ?? 1);
    });
    return result;
  }, [transactions]);

  // ── Category breakdown (for panel) ──────────────────────────────────────
  const categoryBreakdownData = useMemo(
    () =>
      Object.entries(debitsByCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => ({
          category,
          amount,
          pct: totalDebits > 0 ? Math.round((amount / totalDebits) * 100) : 0,
          color: CATEGORY_COLORS[category] ?? "#9ca3af",
        })),
    [debitsByCategory, totalDebits]
  );

  // ── Monthly comparison chart (always last 6 months) ──────────────────────
  const monthlyChartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return { label: d.toLocaleString("en-US", { month: "short" }), month: d.getMonth(), year: d.getFullYear() };
    }).map((m) => ({
      month: m.label,
      income: transactions
        .filter((t) => t.type === "credit" && new Date(t.date).getMonth() === m.month && new Date(t.date).getFullYear() === m.year)
        .reduce((s, t) => s + t.amount, 0),
      expense: transactions
        .filter((t) => t.type === "debit" && new Date(t.date).getMonth() === m.month && new Date(t.date).getFullYear() === m.year)
        .reduce((s, t) => s + t.amount, 0),
    }));
  }, [transactions]);

  // ── Daily spend (for trend chart) ────────────────────────────────────────
  const dailySpend = useMemo(() => {
    const map: Record<string, number> = {};
    periodTxns
      .filter((t) => t.type === "debit")
      .forEach((t) => {
        const key = t.date.split("T")[0];
        map[key] = (map[key] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }, [periodTxns]);

  // ── Observations ─────────────────────────────────────────────────────────
  const observations = useMemo(() => {
    const results: { icon: string; color: string; text: string }[] = [];

    // 1. Category anomaly
    Object.entries(debitsByCategory).forEach(([cat, amount]) => {
      const avg = avgByCategory[cat] ?? 0;
      if (avg > 0 && amount > avg * 1.5) {
        results.push({
          icon: "AlertTriangle",
          color: "#f87171",
          text: `${cat} spending is ${Math.round((amount / avg) * 100 - 100)}% above your 3-month average`,
        });
      }
    });

    // 2. Spending decreased
    if (lastPeriodExpenses > 0 && periodExpenses < lastPeriodExpenses) {
      results.push({
        icon: "TrendingDown",
        color: "#4ade80",
        text: `You spent ${fmt(lastPeriodExpenses - periodExpenses)} less than last period`,
      });
    }

    // 3. Savings milestone
    if (savingsRate >= 50) {
      results.push({
        icon: "Star",
        color: "#2ec4b6",
        text: `Great month — you saved ${savingsRate}% of your income`,
      });
    }

    // 4. Largest single expense
    const largest = periodTxns
      .filter((t) => t.type === "debit")
      .sort((a, b) => b.amount - a.amount)[0];
    if (largest) {
      results.push({
        icon: "ArrowUpRight",
        color: "#fb923c",
        text: `Largest expense: ${largest.merchant} at ${fmt(largest.amount)}`,
      });
    }

    // 5. Most frequent category
    const countByCat = periodTxns
      .filter((t) => t.type === "debit")
      .reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + 1; return acc; }, {} as Record<string, number>);
    const [mostFreqCat, mostFreqCount] = Object.entries(countByCat).sort((a, b) => b[1] - a[1])[0] ?? [];
    if (mostFreqCat) {
      results.push({
        icon: "Repeat",
        color: "#a78bfa",
        text: `${mostFreqCat} had the most transactions (${mostFreqCount})`,
      });
    }

    return results.slice(0, 4);
  }, [periodTxns, debitsByCategory, avgByCategory, savingsRate, lastPeriodExpenses, periodExpenses]);

  // ── Top merchants ────────────────────────────────────────────────────────
  const { rankedMerchants, grandTotal } = useMemo(() => {
    const merchantTotals = periodTxns
      .filter((t) => t.type === "debit")
      .reduce((acc, t) => {
        if (!acc[t.merchant]) {
          acc[t.merchant] = { merchant: t.merchant, category: t.category, count: 0, total: 0 };
        }
        acc[t.merchant].count += 1;
        acc[t.merchant].total += t.amount;
        return acc;
      }, {} as Record<string, MerchantSummary>);

    const ranked = Object.values(merchantTotals).sort((a, b) => b.total - a.total).slice(0, 8);
    const grand = ranked.reduce((s, m) => s + m.total, 0);
    return { rankedMerchants: ranked, grandTotal: grand };
  }, [periodTxns]);

  // ── Empty state ──────────────────────────────────────────────────────────
  const isEmpty = periodTxns.length === 0;

  // ── Savings rate card color ──────────────────────────────────────────────
  const savingsColor =
    savingsRate >= 20 ? "#4ade80" : savingsRate >= 0 ? "#2ec4b6" : "#f87171";

  return (
    <div className="flex min-h-[100svh]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 px-[clamp(1rem,3vw,2.5rem)] pb-20 mt-20 md:mt-4 max-w-[1280px] mx-auto w-full">
          {/* ── Heading ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4"
          >
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Insights</h1>
              <p className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-[#9ca3af] mt-1">Based on your transaction history</p>
            </div>

            {/* Period selector */}
            <div className="flex w-full md:w-auto gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar pb-2 md:pb-0">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border transition-all duration-200 shrink-0 ${
                    selectedPeriod === p
                      ? "bg-accent text-background border-accent"
                      : "border-border text-muted hover:text-foreground hover:border-white/10"
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Empty state ── */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-[clamp(4rem,12vw,10rem)] gap-[clamp(0.75rem,2vw,1.25rem)]">
              <BarChart2 size={48} color="#2a2a2a" />
              <p className="text-white text-base font-medium">No data for this period</p>
              <p className="text-[#9ca3af] text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-center max-w-xs">
                Try selecting a wider time range or add transactions first.
              </p>
              <Link
                href="/transactions"
                className="mt-1 px-[clamp(0.875rem,2vw,1.5rem)] py-2.5 bg-accent text-background rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Go to Transactions
              </Link>
            </div>
          ) : (
            <>
              {/* ── Row 2: Summary Cards ── */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(0.75rem,2vw,1.25rem)] mb-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
                initial="hidden"
                animate="show"
              >
                {/* Card 1 — Top Category */}
                <InsightCard
                  key={`top-cat-${selectedPeriod}`}
                  label="Top Category"
                  value={topCategory?.[0] ?? "—"}
                  subtext={
                    topCategory
                      ? `${fmt(topCategory[1])} · ${topCategoryPct}% of spending`
                      : "No spending data"
                  }
                  accentColor={topCategory ? (CATEGORY_COLORS[topCategory[0]] ?? "#2ec4b6") : "#2ec4b6"}
                  delta={
                    topCategory
                      ? lastTopCategory === topCategory[0]
                        ? "Same as last period"
                        : lastTopCategory
                        ? `Up from ${lastTopCategory}`
                        : undefined
                      : undefined
                  }
                  deltaPositive={lastTopCategory === topCategory?.[0]}
                />

                {/* Card 2 — Savings Rate */}
                <InsightCard
                  key={`savings-${selectedPeriod}`}
                  label="Savings Rate"
                  value={`${savingsRate}%`}
                  subtext={`${fmt(periodIncome - periodExpenses)} net saved`}
                  accentColor={savingsColor}
                  showProgressBar
                  progressValue={savingsRate}
                  periodKey={selectedPeriod}
                />

                {/* Card 3 — Avg Daily Spend */}
                <InsightCard
                  key={`avg-${selectedPeriod}`}
                  label="Avg Daily Spend"
                  value={fmt(avgDailySpend)}
                  subtext={`Over ${daysInPeriod} days`}
                  accentColor="#fb923c"
                  delta={
                    prevAvgDailySpend > 0
                      ? avgDailySpend < prevAvgDailySpend
                        ? `▼ ${fmt(prevAvgDailySpend - avgDailySpend)}/day less than last period`
                        : `▲ ${fmt(avgDailySpend - prevAvgDailySpend)}/day more than last period`
                      : undefined
                  }
                  deltaPositive={avgDailySpend <= prevAvgDailySpend}
                />
              </motion.div>

              {/* ── Row 3: Monthly Chart (3) + Category Breakdown (2) ── */}
              <div className="grid grid-cols-5 gap-[clamp(0.75rem,2vw,1.25rem)] mb-6">
                <div className="col-span-3">
                  <MonthlyComparisonChart key={`monthly-${selectedPeriod}`} data={monthlyChartData} />
                </div>
                <div className="col-span-2">
                  <CategoryBreakdown key={`cat-${selectedPeriod}`} data={categoryBreakdownData} />
                </div>
              </div>

              {/* ── Row 4: Spending Trend (1) + Observations (1) ── */}
              <div className="grid grid-cols-2 gap-[clamp(0.75rem,2vw,1.25rem)] mb-6">
                <SpendingTrendChart key={`trend-${selectedPeriod}`} data={dailySpend} />

                {/* Observations panel */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-[clamp(0.875rem,2vw,1.5rem)] flex flex-col">
                  <h3 className="font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] text-white mb-5">Observations</h3>

                  {observations.length === 0 ? (
                    <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#4a5068] text-center py-8 my-auto">
                      Not enough data to generate insights yet
                    </p>
                  ) : (
                    <motion.div
                      className="space-y-3"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                      }}
                      initial="hidden"
                      animate="show"
                      key={selectedPeriod}
                    >
                      {observations.map((obs, i) => (
                        <ObservationCard
                          key={`${obs.icon}-${i}`}
                          icon={obs.icon}
                          color={obs.color}
                          text={obs.text}
                          index={i}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* ── Row 5: Top Merchants ── */}
              <TopMerchantsTable
                key={`merchants-${selectedPeriod}`}
                merchants={rankedMerchants}
                grandTotal={grandTotal}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
