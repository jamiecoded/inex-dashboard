"use client";

import { motion } from "framer-motion";
import {
  Home,
  ShoppingCart,
  Train,
  DollarSign,
  Zap,
  HelpCircle,
  PieChart,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Housing:   Home,
  Food:      ShoppingCart,
  Transport: Train,
  Income:    DollarSign,
  Utilities: Zap,
  Other:     HelpCircle,
};

const fmt = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);

interface CategoryRow {
  category: string;
  amount: number;
  pct: number;
  color: string;
}

interface CategoryBreakdownProps {
  data: CategoryRow[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-[clamp(0.875rem,2vw,1.5rem)] h-full flex flex-col">
      <h3 className="font-semibold text-[clamp(0.875rem,1.5vw+0.5rem,1.1rem)] text-white mb-1">Spending Breakdown</h3>
      <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] mb-5">By category for selected period</p>

      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <PieChart size={32} className="text-[#2a2a2a]" />
          <p className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-[#4a5068]">No spending data for this period</p>
        </div>
      ) : (
        <motion.div
          className="space-y-1 flex-1"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {data.map(({ category, amount, pct, color }, index) => {
            const Icon = CATEGORY_ICONS[category] ?? HelpCircle;
            return (
              <motion.div
                key={category}
                variants={rowVariants}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03] cursor-default"
              >
                {/* Icon */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color + "1f" }}
                >
                  <Icon size={14} style={{ color }} />
                </div>

                {/* Name */}
                <span
                  className="text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-white font-medium shrink-0"
                  style={{ width: 76 }}
                >
                  {category}
                </span>

                {/* Bar */}
                <div className="flex-1 h-[6px] bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      delay: index * 0.08,
                    }}
                  />
                </div>

                {/* Amount */}
                <span
                  className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] text-white font-mono shrink-0 text-right"
                  style={{ width: 60 }}
                >
                  {fmt(amount)}
                </span>

                {/* Percentage */}
                <span
                  className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af] font-mono shrink-0 text-right"
                  style={{ width: 32 }}
                >
                  {pct}%
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
