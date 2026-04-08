"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

interface SpendingRow {
  name: string;
  color: string;
  Icon: LucideIcon;
  total: number;
  totalPct: number;
}

interface CategorySpendingChartProps {
  data: SpendingRow[];
  periodKey: string;
}

export function CategorySpendingChart({ data, periodKey }: CategorySpendingChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Sort: non-zero first descending, then zeros
  const sorted = [...data].sort((a, b) => {
    if (a.total === 0 && b.total > 0) return 1;
    if (b.total === 0 && a.total > 0) return -1;
    return b.total - a.total;
  });

  const maxTotal = Math.max(1, ...sorted.map((r) => r.total));

  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-[clamp(0.875rem,2vw,1.5rem)] h-full flex flex-col">
      <h3 className="font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] text-white mb-0.5">Spending by Category</h3>
      <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-6">Debit transactions only</p>

      <div className="flex flex-col gap-4 flex-1 justify-center">
        {sorted.map(({ name, color, Icon, total, totalPct }, i) => {
          const isEmpty = total === 0;
          const barWidth = isEmpty ? 0 : (total / maxTotal) * 100;
          const isHov = hovered === name;

          return (
            <div
              key={name}
              className="flex items-center gap-3 transition-opacity duration-150 relative"
              style={{ opacity: isEmpty ? 0.4 : 1 }}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Left: icon + name — fixed 140px */}
              <div className="flex items-center gap-2 shrink-0" style={{ width: 140 }}>
                <Icon size={15} style={{ color }} />
                <span className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white truncate">{name}</span>
              </div>

              {/* Bar */}
              <div className="flex-1 relative">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <motion.div
                    key={`${periodKey}-${name}`}
                    className="h-full rounded-full transition-opacity duration-150"
                    style={{
                      backgroundColor: color,
                      opacity: isHov ? 1 : 0.75,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.06 }}
                  />
                </div>

                {/* Tooltip */}
                {isHov && total > 0 && (
                  <motion.div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-10"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div
                      className="px-3 py-2 rounded-[10px] whitespace-nowrap text-center"
                      style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af]">{name}</p>
                      <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-white font-semibold">{fmt(total)}</p>
                      <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono" style={{ color }}>{totalPct}% of spend</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right: amount — fixed 80px */}
              <div className="shrink-0 text-right" style={{ width: 80 }}>
                <span className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-white">
                  {isEmpty ? "—" : fmt(total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
