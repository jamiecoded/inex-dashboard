"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingDown,
  Star,
  ArrowUpRight,
  Repeat,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  AlertTriangle,
  TrendingDown,
  Star,
  ArrowUpRight,
  Repeat,
};

interface ObservationCardProps {
  icon: string;
  color: string;
  text: string;
  index: number;
}

export function ObservationCard({ icon, color, text, index }: ObservationCardProps) {
  const Icon = ICON_MAP[icon] ?? AlertTriangle;

  // Bold any numbers / currency / percentages in the text
  const formatted = text.replace(
    /(\$[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?%|\d+ transactions?)/g,
    (match) => `**${match}**`
  );
  const parts = formatted.split(/\*\*(.+?)\*\*/g);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut", delay: index * 0.08 },
        },
      }}
      className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-[10px] px-3 py-2.5"
    >
      {/* Icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "1a" }}
      >
        <Icon size={14} style={{ color }} />
      </div>

      {/* Text */}
      <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#9ca3af] leading-relaxed">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <span key={i} className="text-white font-semibold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    </motion.div>
  );
}
