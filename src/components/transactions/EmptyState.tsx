"use client";

import { FileSearch } from "lucide-react";
import { Role } from "@/types";
import { motion } from "framer-motion";

interface Props {
  hasFilters: boolean;
  role: Role;
  onClearFilters: () => void;
  onAdd: () => void;
}

export function EmptyState({ hasFilters, role, onClearFilters, onAdd }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-[clamp(2.5rem,8vw,5rem)] px-[clamp(0.5rem,1.5vw,1rem)] text-center"
    >
      <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mb-6">
        <FileSearch className="w-10 h-10 text-[#2a2a2a]" />
      </div>
      
      <h3 className="text-[#ffffff] text-lg font-medium mb-2">No transactions found</h3>
      <p className="text-[#9ca3af] text-sm mb-8 max-w-sm">
        {hasFilters 
          ? "We couldn't find any transactions matching your current filters. Try adjusting your search or filters." 
          : "Your transaction history is currently empty."}
      </p>

      <div className="flex items-center gap-4">
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-muted hover:border-accent hover:text-accent transition-colors text-sm font-medium"
          >
            Clear filters
          </button>
        )}
        
        {!hasFilters && role === "Admin" && (
          <button
            onClick={onAdd}
            className="px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:scale-[1.03] transition-transform"
          >
            + Add your first transaction
          </button>
        )}
      </div>
    </motion.div>
  );
}
