"use client";

import { Transaction, Role } from "@/types";
import { TransactionRow } from "./TransactionRow";
import { EmptyState } from "./EmptyState";
import { AnimatePresence } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortOption } from "@/hooks/useTransactionFilters";

interface Props {
  transactions: Transaction[];
  role: Role;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
  onAdd: () => void;
}

export function TransactionTable({ 
  transactions, role, onEdit, onDelete, sort, onSortChange, hasFilters, onClearFilters, onAdd 
}: Props) {
  
  if (transactions.length === 0) {
    return (
      <div className="w-full bg-[#111111] rounded-2xl border border-white/5 overflow-hidden mt-6">
        <EmptyState hasFilters={hasFilters} role={role} onClearFilters={onClearFilters} onAdd={onAdd} />
      </div>
    );
  }

  const handleSortClick = (field: "date" | "amount") => {
    if (field === "date") {
      onSortChange(sort === "date-desc" ? "date-asc" : "date-desc");
    } else {
      onSortChange(sort === "amount-desc" ? "amount-asc" : "amount-desc");
    }
  };

  const getSortIcon = (field: "date" | "amount") => {
    if (field === "date") {
      if (sort === "date-desc") return <ArrowDown size={12} className="text-accent" />;
      if (sort === "date-asc") return <ArrowUp size={12} className="text-accent" />;
    }
    if (field === "amount") {
      if (sort === "amount-desc") return <ArrowDown size={12} className="text-accent" />;
      if (sort === "amount-asc") return <ArrowUp size={12} className="text-accent" />;
    }
    return <ArrowUpDown size={12} />;
  };

  return (
    <div className="w-full bg-[#111111] rounded-2xl border border-white/5 mt-6 overflow-hidden">
      <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="flex items-center w-full h-10 bg-black/40 border-b border-white/5 px-[clamp(0.5rem,1.5vw,1rem)]">
        <div className="w-[36%] text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] uppercase font-mono tracking-[0.1em] text-[#9ca3af]">
          Transaction
        </div>
        <div className="w-[15%] text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] uppercase font-mono tracking-[0.1em] text-[#9ca3af]">
          Category
        </div>
        <button 
          onClick={() => handleSortClick("date")}
          className="w-[15%] text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] uppercase font-mono tracking-[0.1em] text-[#9ca3af] flex items-center justify-start gap-1 hover:text-white transition-colors text-left"
        >
          Date {getSortIcon("date")}
        </button>
        <div className="w-[10%] text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] uppercase font-mono tracking-[0.1em] text-[#9ca3af]">
          Type
        </div>
        <button 
          onClick={() => handleSortClick("amount")}
          className="w-[14%] text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] uppercase font-mono tracking-[0.1em] text-[#9ca3af] flex items-center justify-end gap-1 hover:text-white transition-colors text-right"
        >
          Amount {getSortIcon("amount")}
        </button>
        {role === "Admin" && (
          <div className="w-[10%] text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] uppercase font-mono tracking-[0.1em] text-[#9ca3af] text-right">
            Actions
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col w-full">
        <AnimatePresence mode="popLayout">
          {transactions.map((t, i) => (
            <TransactionRow 
              key={t.id}
              transaction={t}
              role={role}
              onEdit={onEdit}
              onDelete={onDelete}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>
      </div>
      </div>
    </div>
  );
}
