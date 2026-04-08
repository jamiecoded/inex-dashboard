"use client";

import { FilterState } from "@/hooks/useTransactionFilters";
import { Category } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  filters: FilterState;
  onRemove: (key: string, val?: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ filters, onRemove, onClearAll }: Props) {
  const activeChips = [];

  if (filters.search) {
    activeChips.push({ id: "search", label: `Search: ${filters.search}`, action: () => onRemove("search") });
  }
  filters.categories.forEach((cat) => {
    activeChips.push({ id: `cat-${cat}`, label: `Category: ${cat}`, action: () => onRemove("category", cat) });
  });
  if (filters.type !== "all") {
    activeChips.push({ id: "type", label: `Type: ${filters.type}`, action: () => onRemove("type") });
  }
  if (filters.dateRange !== "all") {
    const labels: Record<string, string> = {
      "this-month": "This month",
      "last-month": "Last month",
      "last-3-months": "Last 3 months",
      "this-year": "This year",
    };
    activeChips.push({ id: "date", label: `Date: ${labels[filters.dateRange]}`, action: () => onRemove("dateRange") });
  }

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 px-2">
      <AnimatePresence>
        {activeChips.map((chip) => (
          <motion.div
            key={chip.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-accent"
          >
            <span className="text-xs font-mono">{chip.label}</span>
            <button onClick={chip.action} className="hover:text-white transition-colors">
              <X className="w-3 h-3" strokeWidth={3} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={onClearAll}
        className="text-xs text-muted hover:text-foreground underline underline-offset-2 ml-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
