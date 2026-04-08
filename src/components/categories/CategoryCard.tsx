"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, type LucideIcon } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

interface CategoryCardProps {
  name: string;
  color: string;
  Icon: LucideIcon;
  total: number;
  count: number;
  pct: number;
  avg: number;
  delta?: string;        // e.g. "▲ 12%" or "▼ 8%"
  deltaPositive?: boolean;
  isAdmin: boolean;
  cardIndex: number;
  periodKey: string;
  onEdit: () => void;
}

export function CategoryCard({
  name,
  color,
  Icon,
  total,
  count,
  pct,
  avg,
  delta,
  deltaPositive,
  isAdmin,
  cardIndex,
  periodKey,
  onEdit,
}: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const isEmpty = count === 0;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: {
          opacity: isEmpty ? 0.4 : 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut", delay: cardIndex * 0.08 },
        },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-2xl p-[clamp(0.75rem,1.8vw,1.25rem)] border transition-[border-color] duration-200 cursor-default"
      style={{
        backgroundColor: "#111111",
        borderColor: hovered && !isEmpty ? color + "4D" : "rgba(255,255,255,0.05)",
      }}
    >
      {/* Top row — icon + optional pencil */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + "24" }}
        >
          <Icon size={20} style={{ color }} />
        </div>

        {/* Admin pencil */}
        {isAdmin && (
          <motion.button
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            aria-label={`Edit ${name} color`}
          >
            <Pencil size={14} color="#9ca3af" />
          </motion.button>
        )}
      </div>

      {/* Name */}
      <p className="text-[clamp(1rem,1.8vw+0.5rem,1.25rem)] font-medium text-white mt-3 tracking-tight">{name}</p>

      {/* Total */}
      <p
        className="font-mono font-semibold text-white mt-1"
        style={{ fontSize: 22, letterSpacing: "-0.5px" }}
      >
        {fmt(total)}
      </p>

      {/* Count */}
      <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af] mt-0.5">
        {isEmpty ? "No transactions" : `${count} ${count === 1 ? "transaction" : "transactions"}`}
      </p>

      {/* Progress bar */}
      <div className="mt-3.5">
        <div className="flex justify-end mb-1.5">
          <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono" style={{ color }}>
            {pct}%
          </span>
        </div>
        <div className="h-1 w-full rounded-sm overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <motion.div
            key={`${periodKey}-${name}`}
            className="h-full rounded-sm"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut", delay: cardIndex * 0.08 }}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-end justify-between mt-3.5">
        <div>
          <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] text-[#9ca3af] uppercase tracking-[0.12em]">Avg per txn</p>
          <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-white mt-0.5">
            {count > 0 ? fmt(avg) : "—"}
          </p>
        </div>
        <div>
          {delta ? (
            <span
              className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono"
              style={{ color: deltaPositive ? "#4ade80" : "#f87171" }}
            >
              {delta}
            </span>
          ) : (
            <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono" style={{ color: "#4a5068" }}>—</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
