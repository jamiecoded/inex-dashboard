"use client";

import { Transaction, Role } from "@/types";
import { motion } from "framer-motion";
import { 
  Home, ShoppingCart, Train, DollarSign, Zap, HelpCircle, 
  Pencil, Trash2, LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  transaction: Transaction;
  role: Role;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  index: number;
}

const CATEGORY_STYLES: Record<string, { color: string, bg: string, icon: LucideIcon }> = {
  Housing: { color: "#2ec4b6", bg: "rgba(46,196,182,0.12)", icon: Home },
  Food: { color: "#4ade80", bg: "rgba(74,222,128,0.12)", icon: ShoppingCart },
  Transport: { color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: Train },
  Income: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: DollarSign },
  Utilities: { color: "#fb923c", bg: "rgba(251,146,60,0.12)", icon: Zap },
  Other: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: HelpCircle },
};

export function TransactionRow({ transaction, role, onEdit, onDelete, index }: Props) {
  const style = CATEGORY_STYLES[transaction.category] || CATEGORY_STYLES.Other;
  const Icon = style.icon;
  
  const isCredit = transaction.type === "credit";
  const dateObj = new Date(transaction.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(transaction.amount);

  return (
    <motion.div
      layout
      layoutId={transaction.id}
      initial={{ opacity: 0, y: 16, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.04 }}
      className="flex items-center w-full h-[56px] border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-150 group px-[clamp(0.5rem,1.5vw,1rem)]"
    >
      {/* 1. Transaction */}
      <div className="flex items-center gap-4 w-[36%]">
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: style.bg }}
        >
          <Icon size={18} style={{ color: style.color }} />
        </div>
        <div className="flex flex-col truncate">
          <span className="text-[#ffffff] text-sm font-medium truncate">{transaction.merchant}</span>
          <span className="text-[#9ca3af] text-xs truncate">{transaction.subtext}</span>
        </div>
      </div>

      {/* 2. Category */}
      <div className="w-[15%]">
        <div 
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-medium border"
          style={{ 
            backgroundColor: style.bg, 
            color: style.color, 
            borderColor: style.color.replace(')', ', 0.25)').replace('rgb', 'rgba') // simple fallback or just use the color with opacity if possible.
            // Wait, we defined Hex colors. Let's just use CSS vars or border opacity.
          }}
        >
          <div className="border border-white/0" style={{ borderColor: `${style.color}40`, padding: '2px 8px', borderRadius: '999px', margin: '-4px -10px' }}>
             {transaction.category}
          </div>
        </div>
      </div>

      {/* 3. Date */}
      <div className="w-[15%] text-[#9ca3af] text-xs font-mono">
        {formattedDate}
      </div>

      {/* 4. Type */}
      <div className="w-[10%]">
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] font-mono",
          isCredit ? "bg-[#4ade80]/10 text-[#4ade80]" : "bg-[#f87171]/10 text-[#f87171]"
        )}>
          {isCredit ? "Credit" : "Debit"}
        </span>
      </div>

      {/* 5. Amount */}
      <div className={cn(
        "w-[14%] text-right font-mono text-sm font-semibold",
        isCredit ? "text-[#4ade80]" : "text-[#f87171]"
      )}>
        {isCredit ? "+" : "–"}{formattedAmount}
      </div>

      {/* 6. Actions */}
      {role === "Admin" && (
        <div className="w-[10%] flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(transaction)}
            className="p-1.5 text-muted hover:text-accent hover:scale-110 transition-all rounded-md"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 text-muted hover:text-[#f87171] hover:scale-110 transition-all rounded-md"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
