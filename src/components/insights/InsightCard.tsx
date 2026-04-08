"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface InsightCardProps {
  label: string;
  value: string;
  subtext: string;
  accentColor: string;
  delta?: string;
  deltaPositive?: boolean;
  showProgressBar?: boolean;
  progressValue?: number;
  periodKey?: string;
}

export function InsightCard({
  label,
  value,
  subtext,
  accentColor,
  delta,
  deltaPositive,
  showProgressBar,
  progressValue = 0,
  periodKey,
}: InsightCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-[#111111] border border-white/[0.05] rounded-2xl p-[clamp(0.875rem,2vw,1.5rem)] flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:border-white/10"
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ backgroundColor: accentColor }}
      />

      <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono font-bold uppercase tracking-[0.2em] text-[#9ca3af] mt-1">
        {label}
      </span>

      <span
        className="text-[clamp(1.75rem,3.5vw+0.5rem,2.1rem)] font-bold leading-none tracking-tight"
        style={{ color: accentColor }}
      >
        {value}
      </span>

      <span className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af] leading-relaxed">{subtext}</span>

      {showProgressBar && (
        <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            key={periodKey ?? "progress"}
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}

      {delta && (
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          {deltaPositive ? (
            <TrendingDown size={11} style={{ color: "#4ade80" }} />
          ) : (
            <TrendingUp size={11} style={{ color: "#f87171" }} />
          )}
          <span
            className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-medium leading-none"
            style={{ color: deltaPositive ? "#4ade80" : "#f87171" }}
          >
            {delta}
          </span>
        </div>
      )}
    </motion.div>
  );
}
