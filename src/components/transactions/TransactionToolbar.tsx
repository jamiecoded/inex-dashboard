"use client";

import { Search, Download, Plus, ChevronDown, Check } from "lucide-react";
import { FilterState, SortOption, DateRange } from "@/hooks/useTransactionFilters";
import { Category, Role } from "@/types";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  role: Role;
  onAdd: () => void;
  onExport: () => void;
}

const CATEGORIES: Category[] = ["Housing", "Food", "Transport", "Income", "Utilities", "Other"];

export function TransactionToolbar({ filters, onFilterChange, role, onAdd, onExport }: Props) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sync external search clears back into localSearch
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) onFilterChange({ search: localSearch });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const toggleCategory = (cat: Category) => {
    const current = filters.categories;
    if (current.includes(cat)) {
      onFilterChange({ categories: current.filter(c => c !== cat) });
    } else {
      onFilterChange({ categories: [...current, cat] });
    }
  };

  return (
    <div ref={toolbarRef} className="flex flex-wrap items-center justify-between gap-4 w-full relative z-30">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-full max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 pl-9 pr-8 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown("category")}
            className={cn(
              "px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border border-white/5 bg-[#111111] text-sm font-medium flex items-center gap-2 transition-colors",
              filters.categories.length > 0 ? "text-accent border-accent/50" : "text-muted hover:text-foreground"
            )}
          >
            Category <ChevronDown className="w-4 h-4" />
          </button>
          
          {activeDropdown === "category" && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="w-full px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 text-left text-sm flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <div className={cn("w-4 h-4 rounded border flex items-center justify-center", filters.categories.includes(cat) ? "bg-accent border-accent text-black" : "border-white/20")}>
                    {filters.categories.includes(cat) && <Check className="w-3 h-3" />}
                  </div>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown("type")}
            className={cn(
              "px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border border-white/5 bg-[#111111] text-sm font-medium flex items-center gap-2 transition-colors",
              filters.type !== "all" ? "text-accent border-accent/50" : "text-muted hover:text-foreground"
            )}
          >
            {filters.type === "all" ? "Type" : filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} <ChevronDown className="w-4 h-4" />
          </button>
          
          {activeDropdown === "type" && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-[#111111] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1">
              {["all", "credit", "debit"].map(t => (
                <button
                  key={t}
                  onClick={() => { onFilterChange({ type: t as "all" | "credit" | "debit" }); toggleDropdown("type"); }}
                  className={cn("w-full px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 text-left text-sm hover:bg-white/5 transition-colors", filters.type === t ? "text-accent" : "text-foreground")}
                >
                  {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown("date")}
            className={cn(
              "px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border border-white/5 bg-[#111111] text-sm font-medium flex items-center gap-2 transition-colors",
              filters.dateRange !== "all" ? "text-accent border-accent/50" : "text-muted hover:text-foreground"
            )}
          >
            Date <ChevronDown className="w-4 h-4" />
          </button>
          
          {activeDropdown === "date" && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1">
              {[
                { val: "all", label: "All time" },
                { val: "this-month", label: "This month" },
                { val: "last-month", label: "Last month" },
                { val: "last-3-months", label: "Last 3 months" },
                { val: "this-year", label: "This year" }
              ].map(d => (
                <button
                  key={d.val}
                  onClick={() => { onFilterChange({ dateRange: d.val as DateRange }); toggleDropdown("date"); }}
                  className={cn("w-full px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 text-left text-sm hover:bg-white/5 transition-colors", filters.dateRange === d.val ? "text-accent" : "text-foreground")}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown("sort")}
            className="px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border border-white/5 bg-[#111111] text-sm font-medium flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            Sort <ChevronDown className="w-4 h-4" />
          </button>
          
          {activeDropdown === "sort" && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1">
              {[
                { val: "date-desc", label: "Date (newest)" },
                { val: "date-asc", label: "Date (oldest)" },
                { val: "amount-desc", label: "Amount (high-low)" },
                { val: "amount-asc", label: "Amount (low-high)" }
              ].map(s => (
                <button
                  key={s.val}
                  onClick={() => { onFilterChange({ sort: s.val as SortOption }); toggleDropdown("sort"); }}
                  className={cn("w-full px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 text-left text-sm flex justify-between items-center hover:bg-white/5 transition-colors", filters.sort === s.val ? "text-accent" : "text-foreground")}
                >
                  {s.label}
                  {filters.sort === s.val && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border border-white/10 text-sm font-medium text-foreground hover:bg-white/5 transition-colors group"
        >
          <Download className="w-4 h-4 group-active:scale-90 transition-transform" />
          Export
        </button>

        {role === "Admin" && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-[clamp(0.5rem,1.5vw,1rem)] py-2.5 rounded-xl border border-accent bg-accent text-black font-semibold text-sm hover:bg-[#34dacb] hover:scale-[1.03] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-black" strokeWidth={3} />
            Add Transaction
          </button>
        )}
      </div>
    </div>
  );
}
