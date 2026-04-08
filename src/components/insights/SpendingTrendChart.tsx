"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface SpendPoint {
  date: string;  // YYYY-MM-DD
  amount: number;
}

interface SpendingTrendChartProps {
  data: SpendPoint[];
}

const SVG_W = 520;
const SVG_H = 170;
const PAD = { top: 20, bottom: 36, left: 46, right: 16 };

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const graphW = SVG_W - PAD.left - PAD.right;
  const graphH = SVG_H - PAD.top - PAD.bottom;
  const baseY = PAD.top + graphH;

  const maxVal = useMemo(() => Math.max(1, ...data.map((d) => d.amount)), [data]);

  const getX = (i: number) =>
    data.length > 1 ? PAD.left + (i / (data.length - 1)) * graphW : PAD.left + graphW / 2;

  const getY = (amount: number) => PAD.top + (1 - amount / maxVal) * graphH;

  const linePath = useMemo(() => {
    if (data.length === 0) return "";
    return data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(2)} ${getY(d.amount).toFixed(2)}`).join(" ");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const areaPath = useMemo(() => {
    if (data.length === 0) return "";
    const pts = data.map((d, i) => `${getX(i).toFixed(2)} ${getY(d.amount).toFixed(2)}`).join(" L ");
    return `M ${getX(0).toFixed(2)} ${baseY} L ${pts} L ${getX(data.length - 1).toFixed(2)} ${baseY} Z`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // 4 Y-grid labels (0%, 33%, 67%, 100%)
  const gridLines = [0, 0.33, 0.67, 1].map((pct) => ({
    y: PAD.top + (1 - pct) * graphH,
    val: Math.round(maxVal * pct),
  }));

  // 4-5 evenly spaced X-axis labels
  const labelCount = Math.min(5, data.length);
  const labelIndices =
    labelCount <= 1
      ? data.map((_, i) => i)
      : Array.from({ length: labelCount }, (_, i) =>
          Math.round((i * (data.length - 1)) / (labelCount - 1))
        );

  const isEmpty = data.length === 0;

  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-[clamp(0.875rem,2vw,1.5rem)] flex flex-col">
      <h3 className="font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] text-white mb-0.5">Spending Trend</h3>
      <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-5">Daily expenses over time</p>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#4a5068]">No spending data for this period</p>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full overflow-visible"
            style={{ height: SVG_H }}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Grid lines */}
            {gridLines.map(({ y, val }, i) => (
              <g key={i}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={SVG_W - PAD.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fill="#4a5068"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val > 0 ? `$${val}` : "0"}
                </text>
              </g>
            ))}

            {/* Area fill */}
            {areaPath && (
              <motion.path
                d={areaPath}
                fill="rgba(46,196,182,0.06)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              />
            )}

            {/* Line */}
            {linePath && (
              <motion.path
                d={linePath}
                fill="none"
                stroke="#2ec4b6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            )}

            {/* Data point dots */}
            {data.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d.amount);
              const isHov = hovered === i;
              return (
                <g key={d.date}>
                  {/* Invisible hit area */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill="transparent"
                    onMouseEnter={() => setHovered(i)}
                  />
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={isHov ? 5 : 3}
                    fill="#2ec4b6"
                    stroke={isHov ? "rgba(46,196,182,0.3)" : "none"}
                    strokeWidth={isHov ? 4 : 0}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 1 + i * 0.02 }}
                  />

                  {/* Tooltip */}
                  {isHov && (
                    <motion.g
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none"
                    >
                      <rect
                        x={Math.min(cx - 44, SVG_W - PAD.right - 88)}
                        y={cy - 54}
                        width="88"
                        height="42"
                        rx="7"
                        fill="#1a1a1a"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />
                      <text
                        x={Math.min(cx, SVG_W - PAD.right - 44)}
                        y={cy - 36}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize="10"
                      >
                        {fmtDate(d.date)}
                      </text>
                      <text
                        x={Math.min(cx, SVG_W - PAD.right - 44)}
                        y={cy - 20}
                        textAnchor="middle"
                        fill="#f87171"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {fmtCurrency(d.amount)}
                      </text>
                    </motion.g>
                  )}
                </g>
              );
            })}

            {/* X-axis labels */}
            {labelIndices.map((idx) => {
              const cx = getX(idx);
              return (
                <text
                  key={idx}
                  x={cx}
                  y={SVG_H - 6}
                  textAnchor="middle"
                  fill="#4a5068"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {fmtDate(data[idx].date)}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
