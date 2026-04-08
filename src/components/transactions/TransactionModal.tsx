"use client";

import { useState, useEffect } from "react";
import { Transaction, Category } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  mode: "add" | "edit";
  transaction?: Transaction;
  onSave: (t: Transaction) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS: Category[] = ["Housing", "Food", "Transport", "Income", "Utilities", "Other"];

export function TransactionModal({ mode, transaction, onSave, onDelete, onClose }: Props) {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    merchant: transaction?.merchant ?? "",
    subtext: transaction?.subtext ?? "",
    category: transaction?.category ?? "Other",
    date: transaction?.date ?? new Date().toISOString().split("T")[0],
    type: transaction?.type ?? "debit",
    amount: transaction?.amount ?? 0,
  });
  
  const [errors, setErrors] = useState<{ merchant?: boolean; amount?: boolean }>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    const newErrors = {
      merchant: !formData.merchant?.trim(),
      amount: !formData.amount || formData.amount <= 0,
    };
    setErrors(newErrors);

    if (newErrors.merchant || newErrors.amount) return;

    setAnimatePulse(true);
    setTimeout(() => setAnimatePulse(false), 200);

    const completeTx: Transaction = {
      ...formData,
      id: transaction?.id || crypto.randomUUID(),
    } as Transaction;

    setTimeout(() => onSave(completeTx), 200); // slight delay for animation
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder-[#4a5068] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[min(90vw,600px)] bg-[#111111] border border-white/10 rounded-[20px] p-[clamp(1rem,2.5vw,1.75rem)] shadow-2xl z-10"
        >
          {deleteConfirm ? (
            <div className="flex flex-col items-center text-center py-6">
              <h3 className="text-white text-lg font-semibold mb-2">Delete this transaction?</h3>
              <p className="text-[#9ca3af] text-sm mb-8">This action cannot be undone.</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-[clamp(0.5rem,1.5vw,1rem)] py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                >
                  Keep it
                </button>
                <button
                  onClick={() => {
                    if (onDelete && transaction) onDelete(transaction.id);
                  }}
                  className="flex-1 px-[clamp(0.5rem,1.5vw,1rem)] py-3 rounded-xl bg-[#f87171] text-black font-semibold hover:bg-red-400 transition-colors"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-semibold">
                  {mode === "add" ? "Add Transaction" : "Edit Transaction"}
                </h2>
                <button onClick={onClose} className="text-muted hover:text-[#f87171] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Field 1 */}
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 ml-1">Merchant / Description</label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    placeholder="e.g. Whole Foods Market"
                    className={cn(inputClass, errors.merchant && "border-[#f87171] focus:border-[#f87171] focus:ring-[#f87171]/10")}
                  />
                  {errors.merchant && <p className="text-[#f87171] text-xs mt-1 ml-1">Merchant is required</p>}
                </div>

                {/* Subtext */}
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 ml-1">Subtext</label>
                  <input
                    type="text"
                    value={formData.subtext}
                    onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                    placeholder="e.g. Groceries"
                    className={inputClass}
                  />
                </div>

                {/* Field 2 & 3 */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 ml-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount === 0 ? "" : formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        className={cn(inputClass, "pl-8", errors.amount && "border-[#f87171] focus:border-[#f87171] focus:ring-[#f87171]/10")}
                      />
                    </div>
                    {errors.amount && <p className="text-[#f87171] text-xs mt-1 ml-1">Amount must be &gt; 0</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 ml-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "credit" | "debit" })}
                      className={cn(inputClass, "appearance-none")}
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>

                {/* Field 4 & 5 */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 ml-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                      className={cn(inputClass, "appearance-none")}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 ml-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {mode === "edit" && onDelete && (
                <div className="mt-6">
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="text-[#f87171] text-sm hover:underline hover:text-red-400 transition-colors"
                  >
                    Delete transaction
                  </button>
                </div>
              )}

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-transparent text-muted hover:bg-white/5 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  animate={animatePulse ? { scale: [1, 1.04, 1] } : {}}
                  transition={{ duration: 0.2 }}
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-[#34dacb] transition-colors"
                >
                  {mode === "add" ? "Save" : "Update"}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
