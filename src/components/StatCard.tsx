"use client";

import { motion, Variants } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDecryptNumber } from "@/hooks/useDecryptNumber";

interface StatCardProps {
  title: string;
  value: number;
  subtext: string;
  variant: "accent" | "light" | "dark";
  trendUp?: boolean;
}

import { useMemo, useCallback } from "react";

export function StatCard({ title, value, subtext, variant, trendUp = true }: StatCardProps) {
  const formatter = useMemo(() => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }), [variant]);

  const formatFn = useCallback((val: number) => formatter.format(val), [formatter]);

  const displayValue = useDecryptNumber(value, formatFn);

  const containerVariants = {
    accent: "bg-accent text-background",
    light: "bg-[#ededed] text-background", // light gray for income
    dark: "bg-secondary-100/50 border border-border text-foreground", // dark for expenses
  };

  const buttonVariants = {
    accent: "bg-background text-accent",
    light: "border border-background/20 hover:bg-background/10",
    dark: "border border-border text-accent hover:border-accent hover:shadow-[0_0_10px_rgba(46,196,182,0.3)]",
  };

  const valueVariants = {
    accent: "text-background",
    light: "text-background",
    dark: "text-accent",
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      className={cn(
        "rounded-[32px] p-[clamp(1rem,3vw,2rem)] flex flex-col justify-between md:aspect-[1/1.1] min-h-[220px] md:min-h-0 relative overflow-hidden group transition-all duration-300",
        containerVariants[variant],
        variant === "dark" && "hover:border-accent/50 hover:shadow-[0_0_30px_rgba(46,196,182,0.1)]"
      )}
    >
      {/* Decorative Glow for Dark Variant */}
      {variant === "dark" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity duration-500 pointer-events-none" />
      )}
      {/* Decorative Glow for Accent Variant */}
      {variant === "accent" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 blur-3xl translate-x-8 -translate-y-8 pointer-events-none" />
      )}

      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] mb-8 opacity-80">
          {title}
        </h3>
        <span className={cn("text-5xl lg:text-6xl font-bold tracking-tight", valueVariants[variant])}>
          {displayValue}
        </span>
      </div>

      <div className="flex items-end justify-between mt-8">
        <div className="flex items-center gap-2">
          {variant !== "light" && (
            <span className={cn("flex items-center", variant === "dark" ? "text-muted" : "text-background/80")}>
              {trendUp ? (
                <ArrowUpRight className="w-4 h-4 mr-1" strokeWidth={3} />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" strokeWidth={3} />
              )}
            </span>
          )}
          <span className={cn("text-sm font-bold uppercase tracking-wider", variant === "dark" ? "text-muted" : "text-background/80")}>
            {subtext}
          </span>
        </div>

        <button
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
            buttonVariants[variant]
          )}
        >
          {trendUp ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
        </button>
      </div>
    </motion.div>
  );
}
