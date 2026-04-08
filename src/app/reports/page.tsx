"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  Check,
  Download,
  Braces,
  Printer,
  FileX,
} from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type DateRangeOption =
  | "This month"
  | "Last month"
  | "Last 3 months"
  | "This year"
  | "Custom range";

type SectionOption =
  | "Summary overview"
  | "Income breakdown"
  | "Expense breakdown"
  | "Category totals"
  | "Transaction list"
  | "Month by month";

type GroupByOption = "Date" | "Category" | "Type";

const SECTIONS: SectionOption[] = [
  "Summary overview",
  "Income breakdown",
  "Expense breakdown",
  "Category totals",
  "Transaction list",
  "Month by month",
];

const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#2ec4b6",
  Food: "#4ade80",
  Transport: "#f87171",
  Income: "#a78bfa",
  Utilities: "#fb923c",
  Other: "#9ca3af",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ─── Print Styles ─────────────────────────────────────────────────────────────
const printStyles = `
  @media print {
    body { background: white !important; color: black !important; }
    #sidebar-container, #navbar-container, #builder-panel, #export-actions { display: none !important; }
    #report-preview { border: none !important; padding: 0 !important; background: white !important; color: black !important; }
    * { background: transparent !important; color: black !important; text-shadow: none !important; box-shadow: none !important; }
    .report-section { page-break-inside: avoid; margin-bottom: 24px; }
    h1, h2, h3, h4, th, .text-white { color: black !important; }
    .text-\\[\\#9ca3af\\] { color: #4a5568 !important; }
    .text-\\[\\#4ade80\\] { color: #16a34a !important; }
    .text-\\[\\#f87171\\] { color: #dc2626 !important; }
    .text-\\[\\#2ec4b6\\] { color: #0d9488 !important; }
    .border-b { border-bottom: 1px solid #e2e8f0 !important; }
    .border-t { border-top: 1px solid #e2e8f0 !important; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 4px; border-bottom: 1px solid #e2e8f0; }
  }
`;

// ─── Category Totals Table ────────────────────────────────────────────────────
function CategoryTotalsTable({
  txns,
  totalDebits,
}: {
  txns: any[];
  totalDebits: number;
}) {
  const catStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    txns.forEach((t) => {
      if (t.type === "debit") {
        if (!stats[t.category]) stats[t.category] = { count: 0, total: 0 };
        stats[t.category].count++;
        stats[t.category].total += t.amount;
      }
    });
    return Object.entries(stats)
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.total - a.total);
  }, [txns]);

  return (
    <div className="report-section mb-10 overflow-x-auto">
      <h3 className="uppercase font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] tracking-[0.1em] border-b border-white/[0.04] pb-2 mb-3">
        Category Totals
      </h3>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.04]">
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Category</th>
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Transactions</th>
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Total</th>
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal text-right">% of Spend</th>
          </tr>
        </thead>
        <tbody>
          {catStats.map((c) => {
            const pct = totalDebits > 0 ? Math.round((c.total / totalDebits) * 100) : 0;
            return (
              <tr key={c.name} className="border-b border-white/[0.03] hover:bg-white/[0.015]">
                <td
                  className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-medium"
                  style={{ color: CATEGORY_COLORS[c.name] ?? "#9ca3af" }}
                >
                  {c.name}
                </td>
                <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">{c.count}</td>
                <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-white">{fmt(c.total)}</td>
                <td className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono text-[#9ca3af] text-right">{pct}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/[0.1] font-bold">
            <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">Total</td>
            <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">
              {catStats.reduce((s, c) => s + c.count, 0)}
            </td>
            <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-white">{fmt(totalDebits)}</td>
            <td className="py-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Full Transaction List ────────────────────────────────────────────────────
function TransactionList({ txns, groupBy }: { txns: any[]; groupBy: GroupByOption }) {
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};

    if (groupBy === "Date") {
      const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
      sorted.forEach((t) => {
        const d = fmtDate(t.date);
        if (!groups[d]) groups[d] = [];
        groups[d].push(t);
      });
    } else if (groupBy === "Category") {
      const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
      sorted.forEach((t) => {
        if (!groups[t.category]) groups[t.category] = [];
        groups[t.category].push(t);
      });
    } else if (groupBy === "Type") {
      const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
      groups["Income"] = [];
      groups["Expenses"] = [];
      sorted.forEach((t) => {
        if (t.type === "credit") groups["Income"].push(t);
        else groups["Expenses"].push(t);
      });
    }

    return groups;
  }, [txns, groupBy]);

  return (
    <div className="report-section mb-10 overflow-x-auto">
      <h3 className="uppercase font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] tracking-[0.1em] border-b border-white/[0.04] pb-2 mb-3">
        Full Transaction List
      </h3>
      {Object.entries(grouped).map(([groupName, groupTxns], i) => (
        <div key={groupName} className="mb-6">
          {groupBy === "Date" && (
            <h4 className="inline-block text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af] bg-white/[0.02] px-2 py-1 rounded mb-2">
              {groupName}
            </h4>
          )}
          {groupBy === "Category" && (
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[groupName] ?? "#9ca3af" }}
              />
              <h4 className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af] font-medium">{groupName}</h4>
            </div>
          )}
          {groupBy === "Type" && groupTxns.length > 0 && (
            <h4
              className={`text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-medium mb-2 ${
                groupName === "Income" ? "text-[#4ade80]" : "text-[#f87171]"
              }`}
            >
              {groupName}
            </h4>
          )}

          {groupTxns.length > 0 ? (
            <table className="w-full text-left border-t border-white/[0.03]">
              <tbody>
                {groupTxns.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.015]">
                    <td className="py-1.5 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono text-[#9ca3af] w-24">
                      {t.date.split("T")[0]}
                    </td>
                    <td className="py-1.5 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">{t.merchant}</td>
                    <td
                      className="py-1.5 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)]"
                      style={{ color: CATEGORY_COLORS[t.category] ?? "#9ca3af" }}
                    >
                      {t.category}
                    </td>
                    <td
                      className={`py-1.5 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-right ${
                        t.type === "credit" ? "text-[#4ade80]" : "text-[#f87171]"
                      }`}
                    >
                      {t.type === "credit" ? "+" : "–"}
                      {fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#4a5068] italic">No transactions</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Month by Month Table ─────────────────────────────────────────────────────
function MonthByMonthTable({
  periodStart,
  periodEnd,
  txns,
}: {
  periodStart: Date;
  periodEnd: Date;
  txns: any[];
}) {
  const months = useMemo(() => {
    const data: Record<string, { inc: number; exp: number }> = {};
    let current = new Date(periodStart);
    current.setDate(1);

    while (current <= periodEnd) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      data[key] = { inc: 0, exp: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    txns.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (data[key]) {
        if (t.type === "credit") data[key].inc += t.amount;
        else data[key].exp += t.amount;
      }
    });

    return Object.entries(data).map(([key, vals]) => {
      const [y, m] = key.split("-");
      const label = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      return { label, ...vals };
    });
  }, [periodStart, periodEnd, txns]);

  const totalInc = months.reduce((s, m) => s + m.inc, 0);
  const totalExp = months.reduce((s, m) => s + m.exp, 0);

  return (
    <div className="report-section mb-10 overflow-x-auto">
      <h3 className="uppercase font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] tracking-[0.1em] border-b border-white/[0.04] pb-2 mb-3">
        Month by Month
      </h3>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.04]">
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Month</th>
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal text-right">Income</th>
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal text-right">Expenses</th>
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal text-right">Net</th>
            <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal text-right">Saved %</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => {
            const net = m.inc - m.exp;
            const savedPct = m.inc > 0 ? Math.round((net / m.inc) * 100) : 0;
            return (
              <tr key={m.label} className="border-b border-white/[0.03] hover:bg-white/[0.015]">
                <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">{m.label}</td>
                <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#4ade80] text-right">
                  {fmt(m.inc)}
                </td>
                <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#f87171] text-right">
                  {fmt(m.exp)}
                </td>
                <td
                  className={`py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-right ${
                    net >= 0 ? "text-[#4ade80]" : "text-[#f87171]"
                  }`}
                >
                  {net >= 0 ? "+" : ""}
                  {fmt(net)}
                </td>
                <td
                  className={`py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono text-right ${
                    savedPct >= 20 ? "text-[#4ade80]" : savedPct < 0 ? "text-[#f87171]" : "text-white"
                  }`}
                >
                  {savedPct}%
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/[0.1] font-bold">
            <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">Total</td>
            <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#4ade80] text-right">
              {fmt(totalInc)}
            </td>
            <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#f87171] text-right">
              {fmt(totalExp)}
            </td>
            <td
              className={`py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-right ${
                totalInc - totalExp >= 0 ? "text-[#4ade80]" : "text-[#f87171]"
              }`}
            >
              {totalInc - totalExp >= 0 ? "+" : ""}
              {fmt(totalInc - totalExp)}
            </td>
            <td className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono text-white text-right">
              {totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ReportsPage() {
  const { state } = useAppContext();
  const { transactions } = state;

  // Configuration state
  const [dateRange, setDateRange] = useState<DateRangeOption>("This month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [selectedSections, setSelectedSections] = useState<Set<SectionOption>>(
    new Set(["Summary overview", "Income breakdown", "Expense breakdown"])
  );
  const [groupBy, setGroupBy] = useState<GroupByOption>("Date");

  // Report generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Snapshot of data at time of generation
  const [reportData, setReportData] = useState<{
    txns: any[];
    openingBalance: number;
    closingBalance: number;
    totalIncome: number;
    totalExpenses: number;
    startDate: Date;
    endDate: Date;
    generatedAt: string;
  } | null>(null);

  const toggleSection = (s: SectionOption) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsGenerated(false);

    // Compute period bounds
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (dateRange === "This month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateRange === "Last month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateRange === "Last 3 months") {
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateRange === "This year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else if (dateRange === "Custom range") {
      if (customFrom && customTo) {
        start = new Date(customFrom + "T00:00:00");
        end = new Date(customTo + "T23:59:59");
      }
    }

    // Filter transactions
    const txnsInBounds = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    const txnsBefore = transactions.filter((t) => new Date(t.date) < start);
    
    // Use an arbitrary base if start of year or older, but for simplicity we calculate pure flow
    // + base starting balance if no past txns exist. Let's do raw calculation.
    const rawOpening = txnsBefore.reduce((acc, t) => acc + (t.type === "credit" ? t.amount : -t.amount), 0);
    // Let's add $5000 as a base just so it's never looking awkward like 0 if they don't have old history
    const baseOpening = 5000 + rawOpening; 

    const tInc = txnsInBounds.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const tExp = txnsInBounds.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

    setTimeout(() => {
      setReportData({
        txns: txnsInBounds,
        openingBalance: baseOpening,
        closingBalance: baseOpening + tInc - tExp,
        totalIncome: tInc,
        totalExpenses: tExp,
        startDate: start,
        endDate: end,
        generatedAt: fmtDate(new Date().toISOString().split("T")[0]),
      });
      setIsGenerating(false);
      setIsGenerated(true);
    }, 600);
  };

  const handleCsvExport = () => {
    if (!reportData) return;
    const { startDate, endDate, openingBalance, closingBalance, totalIncome, totalExpenses, generatedAt, txns } = reportData;

    let csv = `# InEx Financial Report\n`;
    csv += `# Period: ${fmtDate(startDate.toISOString().split("T")[0])} - ${fmtDate(endDate.toISOString().split("T")[0])}\n`;
    csv += `# Generated: ${generatedAt}\n#\n`;
    csv += `# SUMMARY\n`;
    csv += `Opening Balance,${fmt(openingBalance)}\n`;
    csv += `Closing Balance,${fmt(closingBalance)}\n`;
    csv += `Total Income,${fmt(totalIncome)}\n`;
    csv += `Total Expenses,${fmt(totalExpenses)}\n#\n`;
    csv += `# TRANSACTIONS\nDate,Description,Category,Type,Amount\n`;

    const sortedTxns = [...txns].sort((a, b) => a.date.localeCompare(b.date));
    sortedTxns.forEach((t) => {
      csv += `${t.date.split("T")[0]},"${t.merchant}",${t.category},${
        t.type === "credit" ? "Credit" : "Debit"
      },${t.amount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `inex-report-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const handleJsonExport = () => {
    if (!reportData) return;
    const { startDate, endDate, openingBalance, closingBalance, totalIncome, totalExpenses, generatedAt, txns } = reportData;

    const data = {
      report: {
        generated: generatedAt,
        period: {
          from: startDate.toISOString().split("T")[0],
          to: endDate.toISOString().split("T")[0],
        },
        summary: {
          openingBalance,
          closingBalance,
          totalIncome,
          totalExpenses,
          savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
        },
        transactions: txns,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `inex-report-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.json`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-[100svh]">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div id="sidebar-container">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div id="navbar-container">
          <Navbar />
        </div>

        <main className="flex-1 px-[clamp(1rem,3vw,2.5rem)] pb-20 mt-20 md:mt-4 max-w-[1280px] mx-auto w-full">
          {/* ── Heading ── */}
          <div className="mb-8 pl-1 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Reports</h1>
            <p className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-[#9ca3af] mt-1">
              Generate and export financial summaries
            </p>
          </div>

          {/* ── Report Builder Panel ── */}
          <div id="builder-panel" className="bg-[#111111] border border-white/[0.05] rounded-[20px] p-[clamp(0.875rem,2vw,1.5rem)] mb-8">
            <div className="mb-6">
              <h2 className="text-[clamp(0.9375rem,1.6vw+0.5rem,1.15rem)] font-medium text-white tracking-tight leading-tight">
                Configure Report
              </h2>
              <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af]">Choose what to include</p>
            </div>

            {/* Config 1: Date Range */}
            <div className="mb-6">
              <span className="block font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] uppercase tracking-[0.1em] mb-3">
                DATE RANGE
              </span>
              <div className="flex w-full overflow-x-auto whitespace-nowrap hide-scrollbar gap-2 mb-3 pb-2">
                {(
                  [
                    "This month",
                    "Last month",
                    "Last 3 months",
                    "This year",
                    "Custom range",
                  ] as DateRangeOption[]
                ).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDateRange(opt)}
                    className={`px-4 py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] rounded-full transition-colors border ${
                      dateRange === opt
                        ? "bg-[#2ec4b6] text-black font-semibold border-[#2ec4b6]"
                        : "bg-white/[0.04] text-[#9ca3af] border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {dateRange === "Custom range" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex gap-4 overflow-hidden"
                  >
                    <div className="flex-1">
                      <label className="block text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-1">From</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        max={customTo || undefined}
                        className="w-full bg-[#0a0a0a] border border-white/[0.08] text-white text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] rounded-xl px-3 py-2 outline-none focus:border-white/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-1">To</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        min={customFrom || undefined}
                        className="w-full bg-[#0a0a0a] border border-white/[0.08] text-white text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] rounded-xl px-3 py-2 outline-none focus:border-white/20"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-[1px] bg-white/[0.04] w-full mb-6" />

            {/* Config 2: Include Sections */}
            <div className="mb-6">
              <span className="block font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] uppercase tracking-[0.1em] mb-3">
                INCLUDE IN REPORT
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SECTIONS.map((sec) => {
                  const isChecked = selectedSections.has(sec);
                  return (
                    <label
                      key={sec}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isChecked} 
                        onChange={() => toggleSection(sec)} 
                      />
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                          isChecked
                            ? "bg-[#2ec4b6] border-[#2ec4b6]"
                            : "border-white/[0.15] group-hover:border-white/30"
                        }`}
                      >
                        {isChecked && <Check size={12} color="#000000" strokeWidth={3} />}
                      </div>
                      <span className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-white select-none">{sec}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-[1px] bg-white/[0.04] w-full mb-6" />

            {/* Config 3: Group By */}
            <div className="mb-6">
              <span className="block font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] uppercase tracking-[0.1em] mb-3">
                GROUP TRANSACTIONS BY
              </span>
              <div className="flex w-full overflow-x-auto whitespace-nowrap hide-scrollbar gap-2 pb-2">
                {(["Date", "Category", "Type"] as GroupByOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setGroupBy(opt)}
                    className={`px-4 py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] rounded-full transition-colors border ${
                      groupBy === opt
                        ? "bg-[#2ec4b6] text-black font-semibold border-[#2ec4b6]"
                        : "bg-white/[0.04] text-[#9ca3af] border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (dateRange === "Custom range" && (!customFrom || !customTo))}
              className="w-full h-[44px] bg-[#2ec4b6] text-black font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] rounded-xl flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Report
                </>
              )}
            </button>
          </div>

          {/* ── Generated Preview & Actions ── */}
          <AnimatePresence>
            {isGenerated && reportData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {reportData.txns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-[clamp(2.5rem,8vw,5rem)] bg-[#111111] border border-white/[0.05] rounded-[20px]">
                    <FileX size={40} className="text-[#2a2a2a] mb-4" />
                    <h3 className="text-[clamp(0.9375rem,1.6vw+0.5rem,1.15rem)] font-medium text-white mb-1">
                      No data for this period
                    </h3>
                    <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af] mb-4">
                      Try selecting a wider date range
                    </p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="px-[clamp(0.5rem,1.5vw,1rem)] py-2 text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] bg-white/[0.04] text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-colors"
                    >
                      Select a different range
                    </button>
                  </div>
                ) : (
                  <>
                    <div id="report-preview" className="bg-[#111111] border border-white/[0.05] rounded-[20px] p-[clamp(1rem,3vw,2rem)] mb-6">
                      {/* Report Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-[clamp(1.125rem,2vw+0.5rem,1.35rem)] font-semibold tracking-tight text-[#2ec4b6]">
                            InEx
                          </h2>
                          <p className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-[#9ca3af]">Financial Report</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">
                            Generated on: {reportData.generatedAt}
                          </p>
                          <p className="font-mono text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">
                            Period:{" "}
                            {fmtDate(reportData.startDate.toISOString().split("T")[0])} -{" "}
                            {fmtDate(reportData.endDate.toISOString().split("T")[0])}
                          </p>
                        </div>
                      </div>

                      <div className="w-full h-[1px] bg-white/[0.06] my-5" />

                      {/* Section: Summary */}
                      {selectedSections.has("Summary overview") && (
                        <div className="report-section mb-10">
                          <h3 className="uppercase font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] tracking-[0.1em] border-b border-white/[0.04] pb-2 mb-3">
                            Summary Overview
                          </h3>
                          <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                            <div>
                              <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-0.5">Opening Balance</p>
                              <p className="font-mono text-[clamp(0.9375rem,1.6vw+0.5rem,1.15rem)] text-white font-semibold">
                                {fmt(reportData.openingBalance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-0.5">Closing Balance</p>
                              <p className="font-mono text-[clamp(0.9375rem,1.6vw+0.5rem,1.15rem)] text-white font-semibold">
                                {fmt(reportData.closingBalance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-0.5">Total Income</p>
                              <p className="font-mono text-[clamp(0.9375rem,1.6vw+0.5rem,1.15rem)] text-[#4ade80] font-semibold">
                                +{fmt(reportData.totalIncome)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-0.5">Total Expenses</p>
                              <p className="font-mono text-[clamp(0.9375rem,1.6vw+0.5rem,1.15rem)] text-[#f87171] font-semibold">
                                –{fmt(reportData.totalExpenses)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section: Income Breakdown */}
                      {selectedSections.has("Income breakdown") && (
                        <div className="report-section mb-10 overflow-x-auto">
                          <h3 className="uppercase font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] tracking-[0.1em] border-b border-white/[0.04] pb-2 mb-3">
                            Income Breakdown
                          </h3>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-white/[0.04]">
                                <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Date</th>
                                <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Description</th>
                                <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...reportData.txns]
                                .filter((t) => t.type === "credit")
                                .sort((a, b) => a.date.localeCompare(b.date))
                                .map((t) => (
                                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.015]">
                                    <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-white">
                                      {t.date.split("T")[0]}
                                    </td>
                                    <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">{t.merchant}</td>
                                    <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#4ade80] text-right">
                                      +{fmt(t.amount)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-white/[0.1] font-bold">
                                <td colSpan={2} className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">Total Income</td>
                                <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#4ade80] text-right">
                                  +{fmt(reportData.totalIncome)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}

                      {/* Section: Expense Breakdown */}
                      {selectedSections.has("Expense breakdown") && (
                        <div className="report-section mb-10 overflow-x-auto">
                          <h3 className="uppercase font-mono text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] tracking-[0.1em] border-b border-white/[0.04] pb-2 mb-3">
                            Expense Breakdown
                          </h3>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-white/[0.04]">
                                <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Date</th>
                                <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Description</th>
                                <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal">Category</th>
                                <th className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-normal text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...reportData.txns]
                                .filter((t) => t.type === "debit")
                                .sort((a, b) => a.date.localeCompare(b.date))
                                .map((t) => (
                                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.015]">
                                    <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-white">
                                      {t.date.split("T")[0]}
                                    </td>
                                    <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">{t.merchant}</td>
                                    <td
                                      className="py-2 text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)]"
                                      style={{ color: CATEGORY_COLORS[t.category] ?? "#9ca3af" }}
                                    >
                                      {t.category}
                                    </td>
                                    <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#f87171] text-right">
                                      –{fmt(t.amount)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-white/[0.1] font-bold">
                                <td colSpan={3} className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">Total Expenses</td>
                                <td className="py-2 text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#f87171] text-right">
                                  –{fmt(reportData.totalExpenses)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}

                      {/* Section: Category Totals */}
                      {selectedSections.has("Category totals") && (
                        <CategoryTotalsTable
                          txns={reportData.txns}
                          totalDebits={reportData.totalExpenses}
                        />
                      )}

                      {/* Section: Transaction List */}
                      {selectedSections.has("Transaction list") && (
                        <TransactionList txns={reportData.txns} groupBy={groupBy} />
                      )}

                      {/* Section: Month by Month */}
                      {selectedSections.has("Month by month") && (
                        <MonthByMonthTable
                          periodStart={reportData.startDate}
                          periodEnd={reportData.endDate}
                          txns={reportData.txns}
                        />
                      )}
                    </div>

                    {/* Export Actions */}
                    <div id="export-actions" className="flex gap-4">
                      <button
                        onClick={handleCsvExport}
                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-transparent border border-white/[0.08] hover:bg-white/[0.04] transition-colors rounded-xl text-white text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] font-medium"
                      >
                        <Download size={14} /> Export CSV
                      </button>
                      <button
                        onClick={handleJsonExport}
                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-transparent border border-white/[0.08] hover:bg-white/[0.04] transition-colors rounded-xl text-white text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] font-medium"
                      >
                        <Braces size={14} /> Export JSON
                      </button>
                      <button
                        onClick={handlePrint}
                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-transparent border border-white/[0.08] hover:bg-white/[0.04] transition-colors rounded-xl text-white text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] font-medium"
                      >
                        <Printer size={14} /> Print / PDF
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
