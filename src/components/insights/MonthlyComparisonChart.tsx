"use client";

import { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";

interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyComparisonChartProps {
  data: MonthlyDataPoint[];
}

const MAX_BAR_HEIGHT = 140;
const SVG_W = 560;
const SVG_H = 220;
const PAD = { top: 24, bottom: 40, left: 16, right: 16 };

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const barVariants: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const graphW = SVG_W - PAD.left - PAD.right;
  const baseY = SVG_H - PAD.bottom;

  const maxVal = useMemo(
    () => Math.max(1, ...data.flatMap((d) => [d.income, d.expense])),
    [data]
  );

  const barW = 9;
  const barGap = 4;
  const groupW = barW * 2 + barGap;
  const numGroups = data.length;
  const spacing = numGroups > 1 ? (graphW - numGroups * groupW) / (numGroups - 1) : 0;

  const getH = (v: number) => (v === 0 ? 0 : Math.max(4, (v / maxVal) * MAX_BAR_HEIGHT));

  // Net savings line points
  const netPoints = data.map((d, i) => {
    const x = PAD.left + i * (groupW + spacing) + groupW / 2;
    const net = d.income - d.expense;
    const clampedNet = Math.max(0, net);
    const y = baseY - (clampedNet / maxVal) * MAX_BAR_HEIGHT;
    return { x, y, net };
  });

  const linePath =
    netPoints.length > 1
      ? netPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : "";

  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-[clamp(0.875rem,2vw,1.5rem)] h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] text-white">Monthly Comparison</h3>
          <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mt-0.5">Income vs Expenses by month</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
            <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono text-[#9ca3af] uppercase tracking-widest">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2ec4b6]" />
            <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono text-[#9ca3af] uppercase tracking-widest">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono text-[#9ca3af] uppercase tracking-widest">Net</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full overflow-visible">
          {/* Base line */}
          <line
            x1={PAD.left} y1={baseY}
            x2={SVG_W - PAD.right} y2={baseY}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />

          {/* Net savings line */}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          )}

          {/* Net dots */}
          {netPoints.map((p, i) => (
            <motion.circle
              key={`net-${i}`}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="rgba(255,255,255,0.6)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.9 + i * 0.05 }}
            />
          ))}

          {/* Bars */}
          <motion.g variants={containerVariants} initial="hidden" animate="show">
            {data.map((d, i) => {
              const xPos = PAD.left + i * (groupW + spacing);
              const incH = getH(d.income);
              const expH = getH(d.expense);
              const isHov = hovered === i;
              const anyHov = hovered !== null;

              return (
                <g
                  key={d.month}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity: anyHov && !isHov ? 0.3 : 1 }}
                >
                  {/* Income bar */}
                  {d.income > 0 && (
                    <motion.rect
                      variants={barVariants}
                      x={xPos}
                      y={baseY - incH}
                      width={barW}
                      height={incH}
                      fill="rgba(74,222,128,0.75)"
                      rx={barW / 2}
                    />
                  )}

                  {/* Expense bar */}
                  {d.expense > 0 && (
                    <motion.rect
                      variants={barVariants}
                      x={xPos + barW + barGap}
                      y={baseY - expH}
                      width={barW}
                      height={expH}
                      fill="rgba(46,196,182,0.75)"
                      rx={barW / 2}
                    />
                  )}

                  {/* X label */}
                  <text
                    x={xPos + groupW / 2}
                    y={baseY + 20}
                    textAnchor="middle"
                    fill="#4a5068"
                    fontSize="10"
                    fontWeight="600"
                    letterSpacing="0.08em"
                    fontFamily="monospace"
                  >
                    {d.month.toUpperCase()}
                  </text>

                  {/* Tooltip */}
                  {isHov && (
                    <motion.g
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none"
                    >
                      <rect
                        x={xPos + groupW / 2 - 52}
                        y={baseY - Math.max(incH, expH) - 78}
                        width="104"
                        height="68"
                        rx="8"
                        fill="#1a1a1a"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />
                      <text x={xPos + groupW / 2} y={baseY - Math.max(incH, expH) - 59} textAnchor="middle" fill="#9ca3af" fontSize="10">
                        {d.month}
                      </text>
                      <text x={xPos + groupW / 2} y={baseY - Math.max(incH, expH) - 43} textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">
                        +{fmt(d.income)}
                      </text>
                      <text x={xPos + groupW / 2} y={baseY - Math.max(incH, expH) - 28} textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">
                        -{fmt(d.expense)}
                      </text>
                      <text
                        x={xPos + groupW / 2}
                        y={baseY - Math.max(incH, expH) - 13}
                        textAnchor="middle"
                        fill={d.income - d.expense >= 0 ? "#4ade80" : "#f87171"}
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {d.income - d.expense >= 0 ? "+" : ""}{fmt(d.income - d.expense)}
                      </text>
                    </motion.g>
                  )}
                </g>
              );
            })}
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
