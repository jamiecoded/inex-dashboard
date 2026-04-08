"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAppContext } from "@/context/AppContext";

const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#2ec4b6",
  Food: "#4ade80",
  Transport: "#f87171",
  Income: "#a78bfa",
  Utilities: "#fb923c",
  Other: "#9ca3af",
};

const fmt = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);

export function DonutChart() {
  const { state } = useAppContext();

  const { data, centerValue, total } = useMemo(() => {
    const now = new Date();
    const currentMonthTxns = state.transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    const debits = currentMonthTxns.filter((t) => t.type === "debit");
    const total = debits.reduce((s, t) => s + t.amount, 0);

    if (total === 0) return { data: [], centerValue: 0, total: 0 };

    const grouped = debits.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const calculatedData = Object.entries(grouped)
      .map(([category, amount]) => ({
        label: category,
        amount,
        percentage: Math.round((amount / total) * 100),
        color: CATEGORY_COLORS[category] || "#2a2a2a",
      }))
      .sort((a, b) => b.amount - a.amount);

    return { data: calculatedData, centerValue: total, total };
  }, [state.transactions]);

  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build segments with proper offsets
  const segments = useMemo(() => {
    let currentOffset = 0;
    return data.map((item) => {
      const segmentLength = (item.percentage / 100) * circumference;
      const dashoffset = -currentOffset;
      currentOffset += segmentLength;
      return {
        ...item,
        strokeDasharray: `${Math.max(0, segmentLength - 3)} ${circumference}`,
        strokeDashoffset: dashoffset,
      };
    });
  }, [data, circumference]);

  const isEmpty = data.length === 0;

  return (
    <div className="bg-[#ededed] text-background rounded-[32px] p-[clamp(1rem,3vw,2rem)] flex flex-col justify-between relative overflow-hidden">
      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-6 text-[#1a1a1a]">
          Categories
        </h3>

        <div className="flex items-center justify-between gap-[clamp(1rem,2vw,1.5rem)]">
          {/* Donut SVG */}
          <div className="relative w-[180px] h-[180px] shrink-0">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 origin-center"
            >
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={strokeWidth}
              />

              {isEmpty ? (
                // Empty state placeholder ring
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth={strokeWidth}
                />
              ) : (
                segments.map((seg, i) => (
                  <motion.circle
                    key={seg.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={seg.strokeDasharray}
                    initial={{ strokeDashoffset: circumference }}
                    whileInView={{ strokeDashoffset: seg.strokeDashoffset }}
                    viewport={{ once: false }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ))
              )}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.span
                key={centerValue}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-lg font-bold text-[#1a1a1a] leading-none"
              >
                {isEmpty ? "No expenses" : fmt(centerValue)}
              </motion.span>
              <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] mt-1 font-mono">
                {isEmpty ? "yet" : "this month"}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3 min-w-0">
            {data.slice(0, 5).map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-medium text-[#4a5068] truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-bold text-[#1a1a1a] font-mono shrink-0">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isEmpty && (
        <p className="text-xs text-[#9ca3af] font-medium mt-6">
          Breakdown of {fmt(total)} in expenses this month.
        </p>
      )}
    </div>
  );
}
