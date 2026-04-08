"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home, UtensilsCrossed, Car, Wallet, Zap, Tag,
  Grid3x3, TrendingDown, ArrowUpRight, Info,
  type LucideIcon,
} from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryColorModal } from "@/components/categories/CategoryColorModal";
import { CategorySpendingChart } from "@/components/categories/CategorySpendingChart";
import { CategoryFrequencyPanel } from "@/components/categories/CategoryFrequencyPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "thisMonth" | "last3Months" | "thisYear";

interface CategoryDef {
  name: string;
  defaultColor: string;
  Icon: LucideIcon;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: CategoryDef[] = [
  { name: "Housing",   defaultColor: "#2ec4b6", Icon: Home },
  { name: "Food",      defaultColor: "#4ade80", Icon: UtensilsCrossed },
  { name: "Transport", defaultColor: "#f87171", Icon: Car },
  { name: "Income",    defaultColor: "#a78bfa", Icon: Wallet },
  { name: "Utilities", defaultColor: "#fb923c", Icon: Zap },
  { name: "Other",     defaultColor: "#9ca3af", Icon: Tag },
];

const PERIOD_LABELS: Record<Period, string> = {
  thisMonth:   "This month",
  last3Months: "Last 3 months",
  thisYear:    "This year",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

const LS_KEY = "fintrack_categories";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { state } = useAppContext();
  const { transactions, role } = state;
  const isAdmin = role === "Admin";

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("thisMonth");
  const [editingCategory, setEditingCategory] = useState<CategoryDef | null>(null);

  // Custom colors — loaded from localStorage, Admin can edit
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) setCustomColors(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const getColor = (name: string, defaultColor: string) => customColors[name] ?? defaultColor;

  const handleSaveColor = (categoryName: string, color: string) => {
    const updated = { ...customColors, [categoryName]: color };
    setCustomColors(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
    }
    setEditingCategory(null);
  };

  // ── Period filter ────────────────────────────────────────────────────────
  const periodTxns = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (selectedPeriod === "thisMonth")
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (selectedPeriod === "last3Months") {
        const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 3);
        return d >= cutoff;
      }
      if (selectedPeriod === "thisYear")
        return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, selectedPeriod]);

  // ── Last period (for delta) ──────────────────────────────────────────────
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
      if (selectedPeriod === "thisYear")
        return d.getFullYear() === now.getFullYear() - 1;
      return false;
    });
  }, [transactions, selectedPeriod]);

  const lastPeriodCategoryTotals = useMemo(
    () =>
      lastPeriodTxns
        .filter((t) => t.type === "debit")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] ?? 0) + t.amount;
          return acc;
        }, {} as Record<string, number>),
    [lastPeriodTxns]
  );

  // ── Summary strip ────────────────────────────────────────────────────────
  const totalDebits = useMemo(
    () => periodTxns.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0),
    [periodTxns]
  );

  const largestDebit = useMemo(
    () => [...periodTxns].filter((t) => t.type === "debit").sort((a, b) => b.amount - a.amount)[0],
    [periodTxns]
  );

  const countByCategory = useMemo(
    () =>
      periodTxns.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    [periodTxns]
  );

  const mostFrequent = useMemo(
    () => Object.entries(countByCategory).sort((a, b) => b[1] - a[1])[0],
    [countByCategory]
  );

  const activeCategories = useMemo(
    () => new Set(periodTxns.map((t) => t.category)).size,
    [periodTxns]
  );

  const mostFreqCatDef = DEFAULT_CATEGORIES.find((c) => c.name === mostFrequent?.[0]);

  // ── Category cards stats ─────────────────────────────────────────────────
  const categoryStats = useMemo(() => {
    const debits = periodTxns.filter((t) => t.type === "debit");
    const totalAllDebits = debits.reduce((s, t) => s + t.amount, 0);

    return DEFAULT_CATEGORIES.map((cat) => {
      const catTxns = debits.filter((t) => t.category === cat.name);
      const total = catTxns.reduce((s, t) => s + t.amount, 0);
      const count = catTxns.length;
      const pct = totalAllDebits > 0 ? Math.round((total / totalAllDebits) * 100) : 0;
      const avg = count > 0 ? Math.round(total / count) : 0;
      const lastTotal = lastPeriodCategoryTotals[cat.name] ?? 0;

      let delta: string | undefined;
      let deltaPositive = false;
      if (total > 0 && lastTotal > 0) {
        const pctChange = Math.round(((total - lastTotal) / lastTotal) * 100);
        if (pctChange > 0) { delta = `▲ ${pctChange}%`; deltaPositive = false; }
        else if (pctChange < 0) { delta = `▼ ${Math.abs(pctChange)}%`; deltaPositive = true; }
        else { delta = "Same"; deltaPositive = true; }
      }

      return { ...cat, total, count, pct, avg, delta, deltaPositive };
    });
  }, [periodTxns, lastPeriodCategoryTotals]);

  // ── Spending chart data ──────────────────────────────────────────────────
  const spendingChartData = useMemo(
    () =>
      categoryStats.map(({ name, defaultColor, Icon, total, pct }) => ({
        name,
        color: getColor(name, defaultColor),
        Icon,
        total,
        totalPct: pct,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryStats, customColors]
  );

  // ── Frequency panel data ─────────────────────────────────────────────────
  const frequencyData = useMemo(() => {
    return DEFAULT_CATEGORIES.map(({ name, defaultColor, Icon }) => {
      const catTxns = periodTxns.filter((t) => t.category === name);
      return {
        name,
        color: getColor(name, defaultColor),
        Icon,
        count: catTxns.length,
        credits: catTxns.filter((t) => t.type === "credit").length,
        debits: catTxns.filter((t) => t.type === "debit").length,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodTxns, customColors]);

  const isEmpty = periodTxns.length === 0;

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
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Categories</h1>
              <p className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-[#9ca3af] mt-1">
                Manage and analyse your spending categories
              </p>
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

          {/* ── Empty state banner ── */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-[clamp(0.5rem,1.5vw,1rem)] py-3 rounded-[10px] mb-6"
              style={{
                backgroundColor: "rgba(251,146,60,0.08)",
                border: "1px solid rgba(251,146,60,0.2)",
              }}
            >
              <Info size={16} color="#fb923c" className="shrink-0" />
              <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af]">
                No transactions found for this period. Add transactions to see category data.{" "}
                <Link href="/transactions" className="text-accent hover:underline">
                  Go to Transactions →
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── Summary strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Pill 1 — Active categories */}
            <div
              className="flex items-center gap-3 px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border"
              style={{ backgroundColor: "#111111", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <Grid3x3 size={16} color="#2ec4b6" className="shrink-0" />
              <div className="min-w-0">
                <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">Active categories</p>
                <p className="text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] font-mono text-white">{activeCategories}</p>
              </div>
            </div>

            {/* Pill 2 — Total spent */}
            <div
              className="flex items-center gap-3 px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border"
              style={{ backgroundColor: "#111111", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <TrendingDown size={16} color="#f87171" className="shrink-0" />
              <div className="min-w-0">
                <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">Total spent</p>
                <p className="text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] font-mono" style={{ color: "#f87171" }}>
                  {totalDebits > 0 ? fmt(totalDebits) : "—"}
                </p>
              </div>
            </div>

            {/* Pill 3 — Largest expense */}
            <div
              className="flex items-center gap-3 px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border"
              style={{ backgroundColor: "#111111", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <ArrowUpRight size={16} color="#fb923c" className="shrink-0" />
              <div className="min-w-0 overflow-hidden">
                <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">Largest expense</p>
                <p className="text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] font-mono text-white">
                  {largestDebit ? fmt(largestDebit.amount) : "—"}
                </p>
                {largestDebit && (
                  <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] truncate">{largestDebit.merchant}</p>
                )}
              </div>
            </div>

            {/* Pill 4 — Most used */}
            <div
              className="flex items-center gap-3 px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border"
              style={{ backgroundColor: "#111111", borderColor: "rgba(255,255,255,0.05)" }}
            >
              {mostFreqCatDef ? (
                <mostFreqCatDef.Icon
                  size={16}
                  style={{ color: getColor(mostFreqCatDef.name, mostFreqCatDef.defaultColor) }}
                  className="shrink-0"
                />
              ) : (
                <Tag size={16} color="#9ca3af" className="shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">Most transactions</p>
                <p
                  className="text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] font-mono"
                  style={{
                    color: mostFreqCatDef
                      ? getColor(mostFreqCatDef.name, mostFreqCatDef.defaultColor)
                      : "#9ca3af",
                  }}
                >
                  {mostFrequent?.[0] ?? "—"}
                </p>
                {mostFrequent && (
                  <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af]">{mostFrequent[1]} transactions</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Row 3: Category cards 2×3 grid ── */}
          <motion.div
            className="grid grid-cols-3 gap-[clamp(0.75rem,2vw,1.25rem)] mb-8"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            animate="show"
          >
            {categoryStats.map((cat, i) => (
              <CategoryCard
                key={cat.name}
                name={cat.name}
                color={getColor(cat.name, cat.defaultColor)}
                Icon={cat.Icon}
                total={cat.total}
                count={cat.count}
                pct={cat.pct}
                avg={cat.avg}
                delta={cat.delta}
                deltaPositive={cat.deltaPositive}
                isAdmin={isAdmin}
                cardIndex={i}
                periodKey={selectedPeriod}
                onEdit={() => setEditingCategory(cat)}
              />
            ))}
          </motion.div>

          {/* ── Row 4: Charts side by side ── */}
          <div className="grid grid-cols-2 gap-[clamp(0.75rem,2vw,1.25rem)]">
            <CategorySpendingChart
              key={`spending-${selectedPeriod}`}
              data={spendingChartData}
              periodKey={selectedPeriod}
            />
            <CategoryFrequencyPanel
              key={`freq-${selectedPeriod}`}
              data={frequencyData}
              periodKey={selectedPeriod}
            />
          </div>
        </main>
      </div>

      {/* ── Admin Color Edit Modal ── */}
      {editingCategory && isAdmin && (
        <CategoryColorModal
          categoryName={editingCategory.name}
          currentColor={getColor(editingCategory.name, editingCategory.defaultColor)}
          Icon={editingCategory.Icon}
          onClose={() => setEditingCategory(null)}
          onSave={(color) => handleSaveColor(editingCategory.name, color)}
        />
      )}
    </div>
  );
}
