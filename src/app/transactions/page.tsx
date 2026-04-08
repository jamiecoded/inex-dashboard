"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionToolbar } from "@/components/transactions/TransactionToolbar";
import { FilterChips } from "@/components/transactions/FilterChips";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useAppContext } from "@/context/AppContext";
import { useTransactionFilters, FilterState } from "@/hooks/useTransactionFilters";
import { useState } from "react";
import { Transaction } from "@/types";

export default function TransactionsPage() {
  const { state, dispatch } = useAppContext();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    type: "all",
    dateRange: "all",
    sort: "date-desc",
  });

  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: "add" | "edit"; transaction?: Transaction }>({
    isOpen: false,
    mode: "add",
  });

  const filteredTransactions = useTransactionFilters(state.transactions, filters);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleClearFilters = () => {
    setFilters((prev) => ({ ...prev, search: "", categories: [], type: "all", dateRange: "all" }));
  };

  const handleRemoveFilter = (key: string, val?: string) => {
    if (key === "search") handleFilterChange({ search: "" });
    if (key === "type") handleFilterChange({ type: "all" });
    if (key === "dateRange") handleFilterChange({ dateRange: "all" });
    if (key === "category" && val) {
      handleFilterChange({ categories: filters.categories.filter((c) => c !== val) });
    }
  };

  const hasFiltersActive = filters.search !== "" || filters.categories.length > 0 || filters.type !== "all" || filters.dateRange !== "all";

  const handleExport = () => {
    const headers = "Date,Merchant,Category,Type,Amount";
    const rows = filteredTransactions.map((t) => `${t.date},"${t.merchant}",${t.category},${t.type},${t.amount}`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-[100svh]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 overflow-y-auto px-[clamp(1rem,3vw,2.5rem)] pb-20">
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Transactions</h1>
            
            <TransactionToolbar
              filters={filters}
              onFilterChange={handleFilterChange}
              role={state.role}
              onAdd={() => setModalState({ isOpen: true, mode: "add" })}
              onExport={handleExport}
            />

            <FilterChips
              filters={filters}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearFilters}
            />

            <TransactionTable
              transactions={filteredTransactions}
              role={state.role}
              sort={filters.sort}
              onSortChange={(sort) => handleFilterChange({ sort })}
              hasFilters={hasFiltersActive}
              onClearFilters={handleClearFilters}
              onAdd={() => setModalState({ isOpen: true, mode: "add" })}
              onEdit={(t) => setModalState({ isOpen: true, mode: "edit", transaction: t })}
              onDelete={(id) => dispatch({ type: "DELETE_TRANSACTION", payload: id })}
            />

            {modalState.isOpen && state.role === "Admin" && (
              <TransactionModal
                mode={modalState.mode}
                transaction={modalState.transaction}
                onClose={() => setModalState({ isOpen: false, mode: "add" })}
                onSave={(t) => {
                  if (modalState.mode === "add") {
                    dispatch({ type: "ADD_TRANSACTION", payload: t });
                  } else {
                    dispatch({ type: "UPDATE_TRANSACTION", payload: t });
                  }
                  setModalState({ isOpen: false, mode: "add" });
                }}
                onDelete={(id) => {
                  dispatch({ type: "DELETE_TRANSACTION", payload: id });
                  setModalState({ isOpen: false, mode: "add" });
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
