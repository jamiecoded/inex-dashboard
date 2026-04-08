"use client";

import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Home,
  ShoppingCart,
  Train,
  DollarSign,
  Zap,
  HelpCircle,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const CATEGORY_STYLE: Record<
  string,
  { color: string; bg: string; icon: React.ComponentType<{ size?: number; color?: string }> }
> = {
  Housing:   { color: "#2ec4b6", bg: "rgba(46,196,182,0.15)",  icon: Home },
  Food:      { color: "#4ade80", bg: "rgba(74,222,128,0.15)",  icon: ShoppingCart },
  Transport: { color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: Train },
  Income:    { color: "#a78bfa", bg: "rgba(167,139,250,0.15)", icon: DollarSign },
  Utilities: { color: "#fb923c", bg: "rgba(251,146,60,0.15)",  icon: Zap },
  Other:     { color: "#9ca3af", bg: "rgba(156,163,175,0.15)", icon: HelpCircle },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function RecentTable() {
  const { state } = useAppContext();

  const recentTxns = useMemo(
    () =>
      [...state.transactions]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, 5),
    [state.transactions]
  );

  return (
    <div className="bg-secondary-100 rounded-[32px] p-[clamp(1rem,3vw,2rem)] border border-border">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold tracking-tight">Recent Flow</h3>
        <Link
          href="/transactions"
          className="text-xs font-bold uppercase tracking-wider px-[clamp(0.5rem,1.5vw,1rem)] py-2 rounded-full border border-border text-muted hover:bg-white/5 hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>

      {recentTxns.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">No transactions yet</p>
      ) : (
        <>
          {/* Header */}
          <div className="w-full overflow-x-auto" style={{WebkitOverflowScrolling:'touch'}}>
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] md:grid-cols-4 gap-4 pb-4 border-b border-border/50 text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-bold uppercase tracking-[0.2em] text-muted">
            <div>Transaction</div>
            <div className="text-center">Category</div>
            <div className="text-center">Date</div>
            <div className="text-right">Amount</div>
          </div>

          {/* Rows */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {recentTxns.map((txn) => {
              const style = CATEGORY_STYLE[txn.category] ?? CATEGORY_STYLE.Other;
              const Icon = style.icon;
              const isCredit = txn.type === "credit";
              const formattedDate = new Date(txn.date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              );
              const formattedAmount =
                (isCredit ? "+" : "–") +
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(txn.amount);

              return (
                <motion.div
                  key={txn.id}
                  variants={rowVariants}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] md:grid-cols-4 gap-4 py-4 items-center border-b border-border/30 last:border-0 hover:bg-white/[0.02] rounded-xl -mx-2 px-2 transition-colors cursor-pointer group"
                >
                  {/* Merchant */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: style.bg }}
                    >
                      <Icon size={16} color={style.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {txn.merchant}
                      </p>
                      <p className="text-xs text-muted truncate">{txn.subtext}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex justify-center">
                    <span
                      className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                      style={{
                        color: style.color,
                        borderColor: style.color + "40",
                        backgroundColor: style.bg,
                      }}
                    >
                      {txn.category}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-center text-sm font-mono text-muted">
                    {formattedDate}
                  </div>

                  {/* Amount */}
                  <div
                    className={cn(
                      "text-right font-bold font-mono text-base",
                      isCredit ? "text-[#4ade80]" : "text-[#f87171]"
                    )}
                  >
                    {formattedAmount}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
