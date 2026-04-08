"use client";

import { motion, Variants } from "framer-motion";
import { Crown } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Housing:   "#2ec4b6",
  Food:      "#4ade80",
  Transport: "#f87171",
  Income:    "#a78bfa",
  Utilities: "#fb923c",
  Other:     "#9ca3af",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export interface MerchantSummary {
  merchant: string;
  category: string;
  count: number;
  total: number;
}

interface TopMerchantsTableProps {
  merchants: MerchantSummary[];
  grandTotal: number;
}

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const RANK_COLORS = ["#2ec4b6", "#9ca3af", "#fb923c"];

export function TopMerchantsTable({ merchants, grandTotal }: TopMerchantsTableProps) {
  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-2xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-[clamp(0.875rem,2vw,1.5rem)] py-5 border-b border-white/[0.05]">
        <h3 className="font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] text-white">Top Merchants</h3>
        <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">By total spend this period</span>
      </div>

      {merchants.length === 0 ? (
        <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#4a5068] text-center py-10">
          No spending data for this period
        </p>
      ) : (
        <>
          {/* Table header */}
          <div
            className="grid px-[clamp(0.875rem,2vw,1.5rem)] py-3 border-b border-white/[0.05]"
            style={{ gridTemplateColumns: "40px 1fr 120px 130px 110px" }}
          >
            {["#", "Merchant", "Transactions", "Total Spent", "Share"].map((col) => (
              <span
                key={col}
                className="text-[clamp(0.875rem,0.5vw+0.7rem,0.875rem)] font-mono font-bold uppercase tracking-[0.15em] text-[#4a5068] last:text-right"
              >
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {merchants.map((m, i) => {
              const share = grandTotal > 0 ? Math.round((m.total / grandTotal) * 100) : 0;
              const color = CATEGORY_COLORS[m.category] ?? "#9ca3af";
              const rankColor = i < 3 ? RANK_COLORS[i] : "#4a5068";

              return (
                <motion.div
                  key={m.merchant}
                  variants={rowVariants}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="grid items-center px-[clamp(0.875rem,2vw,1.5rem)] border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-default h-[52px]"
                  style={{ gridTemplateColumns: "40px 1fr 120px 130px 110px" }}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-1">
                    {i === 0 ? (
                      <Crown size={12} style={{ color: rankColor }} />
                    ) : (
                      <span
                        className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono font-bold"
                        style={{ color: rankColor }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Merchant + category badge */}
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="min-w-0">
                      <p className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-white font-medium truncate leading-tight">
                        {m.merchant}
                      </p>
                      <span
                        className="inline-block mt-0.5 text-[clamp(0.875rem,0.5vw+0.7rem,0.875rem)] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                        style={{
                          color,
                          borderColor: color + "50",
                          backgroundColor: color + "15",
                        }}
                      >
                        {m.category}
                      </span>
                    </div>
                  </div>

                  {/* Transactions count */}
                  <div>
                    <span className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af]">
                      {m.count} {m.count === 1 ? "transaction" : "transactions"}
                    </span>
                  </div>

                  {/* Total spent */}
                  <div>
                    <span className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-white font-mono font-semibold">
                      {fmt(m.total)}
                    </span>
                  </div>

                  {/* Share — mini bar + % */}
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-[60px] h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${share}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                      />
                    </div>
                    <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono text-[#9ca3af] w-8 text-right">
                      {share}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}
