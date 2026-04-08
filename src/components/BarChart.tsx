"use client";

import { motion, Variants } from "framer-motion";
import { useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";

const MAX_BAR_HEIGHT = 120;

const fmt = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);

export function BarChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { state } = useAppContext();

  const last6Months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return {
        label: d.toLocaleString("en-US", { month: "short" }),
        month: d.getMonth(),
        year: d.getFullYear(),
      };
    });
  }, []);

  const data = useMemo(
    () =>
      last6Months.map((m) => ({
        month: m.label,
        income: state.transactions
          .filter(
            (t) =>
              t.type === "credit" &&
              new Date(t.date).getMonth() === m.month &&
              new Date(t.date).getFullYear() === m.year
          )
          .reduce((s, t) => s + t.amount, 0),
        expense: state.transactions
          .filter(
            (t) =>
              t.type === "debit" &&
              new Date(t.date).getMonth() === m.month &&
              new Date(t.date).getFullYear() === m.year
          )
          .reduce((s, t) => s + t.amount, 0),
      })),
    [state.transactions, last6Months]
  );

  // SVG layout
  const width = 600;
  const height = 220;
  const padding = { top: 20, bottom: 40, left: 20, right: 20 };
  const graphWidth = width - padding.left - padding.right;

  const barWidth = 8;
  const barGap = 4;
  const groupWidth = barWidth * 2 + barGap;
  const numGroups = data.length;
  const spacing = (graphWidth - numGroups * groupWidth) / (numGroups - 1);

  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => [d.income, d.expense])
  );

  const getBarH = (val: number) => {
    if (val === 0) return 0;
    return Math.max(4, (val / maxVal) * MAX_BAR_HEIGHT);
  };

  const baseY = height - padding.bottom;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const barVariants: Variants = {
    hidden: { scaleY: 0, originY: 1 },
    show: { scaleY: 1, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <div className="bg-secondary-100 rounded-[32px] p-[clamp(1rem,3vw,2rem)] col-span-2 relative border border-border">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold tracking-tight">Balance Trend</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono text-muted uppercase tracking-widest">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono text-muted uppercase tracking-widest">Expenses</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-border text-muted">
            6M
          </span>
        </div>
      </div>

      <div className="w-full relative h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          {/* Base Line */}
          <line
            x1={padding.left}
            y1={baseY}
            x2={width - padding.right}
            y2={baseY}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <motion.g
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {data.map((d, i) => {
              const xPos = padding.left + i * (groupWidth + spacing);
              const incH = getBarH(d.income);
              const expH = getBarH(d.expense);
              const isHovered = hovered === i;
              const isAnyHovered = hovered !== null;

              return (
                <g
                  key={d.month}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="transition-opacity duration-300 cursor-pointer"
                  style={{ opacity: isAnyHovered && !isHovered ? 0.3 : 1 }}
                >
                  {/* Income Bar (white) */}
                  {d.income > 0 && (
                    <motion.rect
                      variants={barVariants}
                      x={xPos}
                      y={baseY - incH}
                      width={barWidth}
                      height={incH}
                      fill="#ffffff"
                      rx={barWidth / 2}
                    />
                  )}

                  {/* Expense Bar (teal accent) */}
                  {d.expense > 0 && (
                    <motion.rect
                      variants={barVariants}
                      x={xPos + barWidth + barGap}
                      y={baseY - expH}
                      width={barWidth}
                      height={expH}
                      fill="#2ec4b6"
                      rx={barWidth / 2}
                    />
                  )}

                  {/* X-Axis Label */}
                  <text
                    x={xPos + groupWidth / 2}
                    y={baseY + 22}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="10"
                    fontWeight="bold"
                    letterSpacing="0.08em"
                  >
                    {d.month}
                  </text>

                  {/* Tooltip */}
                  {isHovered && (d.income > 0 || d.expense > 0) && (
                    <motion.g
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pointer-events-none"
                    >
                      <rect
                        x={xPos + groupWidth / 2 - 48}
                        y={baseY - Math.max(incH, expH) - 56}
                        width="96"
                        height="46"
                        rx="8"
                        fill="#1a1a1a"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <text
                        x={xPos + groupWidth / 2}
                        y={baseY - Math.max(incH, expH) - 38}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        +{fmt(d.income)}
                      </text>
                      <text
                        x={xPos + groupWidth / 2}
                        y={baseY - Math.max(incH, expH) - 22}
                        textAnchor="middle"
                        fill="#f87171"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        -{fmt(d.expense)}
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
