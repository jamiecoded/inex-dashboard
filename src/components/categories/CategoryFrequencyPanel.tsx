"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface FreqRow {
  name: string;
  color: string;
  Icon: LucideIcon;
  count: number;
  credits: number;
  debits: number;
}

interface CategoryFrequencyPanelProps {
  data: FreqRow[];
  periodKey: string;
}

export function CategoryFrequencyPanel({ data, periodKey }: CategoryFrequencyPanelProps) {
  // Sort by count descending; zeros at bottom
  const sorted = [...data].sort((a, b) => {
    if (a.count === 0 && b.count > 0) return 1;
    if (b.count === 0 && a.count > 0) return -1;
    return b.count - a.count;
  });

  const maxCount = Math.max(1, ...sorted.map((r) => r.count));

  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-[clamp(0.875rem,2vw,1.5rem)] h-full flex flex-col">
      <h3 className="font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] text-white mb-0.5">Transaction Frequency</h3>
      <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-6">All transaction types</p>

      <div className="flex flex-col gap-[clamp(0.75rem,2vw,1.25rem)] flex-1 justify-center">
        {sorted.map(({ name, color, Icon, count, credits, debits }, i) => {
          const isEmpty = count === 0;
          const barWidth = isEmpty ? 0 : (count / maxCount) * 100;

          return (
            <div
              key={name}
              className="flex flex-col gap-1.5 transition-opacity duration-150"
              style={{ opacity: isEmpty ? 0.4 : 1 }}
            >
              {/* Row: icon+name | bar | count */}
              <div className="flex items-center gap-3">
                {/* Left */}
                <div className="flex items-center gap-2 shrink-0" style={{ width: 140 }}>
                  <Icon size={15} style={{ color }} />
                  <span className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white">{name}</span>
                </div>

                {/* Bar */}
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    key={`${periodKey}-${name}`}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color + "B3" }} // 70% opacity
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.06 }}
                  />
                </div>

                {/* Count */}
                <div className="shrink-0 text-right" style={{ width: 68 }}>
                  <span className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#9ca3af]">
                    {isEmpty ? "—" : `${count} txns`}
                  </span>
                </div>
              </div>

              {/* Credit / debit pills */}
              {!isEmpty && (
                <div className="pl-[148px] flex gap-1.5">
                  {credits > 0 && (
                    <span
                      className="text-[clamp(0.875rem,0.5vw+0.7rem,0.875rem)] font-mono px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(74,222,128,0.1)",
                        color: "#4ade80",
                      }}
                    >
                      {credits} in
                    </span>
                  )}
                  {debits > 0 && (
                    <span
                      className="text-[clamp(0.875rem,0.5vw+0.7rem,0.875rem)] font-mono px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(248,113,113,0.1)",
                        color: "#f87171",
                      }}
                    >
                      {debits} out
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
