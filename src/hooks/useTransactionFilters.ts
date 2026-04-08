import { useMemo } from "react";
import { Transaction, Category } from "@/types";

export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
export type DateRange = "all" | "this-month" | "last-month" | "last-3-months" | "this-year";

export interface FilterState {
  search: string;
  categories: Category[];
  type: "all" | "credit" | "debit";
  dateRange: DateRange;
  sort: SortOption;
}

export function useTransactionFilters(transactions: Transaction[], filters: FilterState) {
  return useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.subtext.toLowerCase().includes(q)
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter((t) => filters.categories.includes(t.category));
    }

    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.dateRange !== "all") {
      // Mock data is Nov 2024 - Apr 2025. Pin "now" to Apr 2025 to make filters realistic.
      const currentDate = new Date("2025-04-15");
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      result = result.filter((t) => {
        const tDate = new Date(t.date);
        const tYear = tDate.getFullYear();
        const tMonth = tDate.getMonth();

        switch (filters.dateRange) {
          case "this-month":
            return tYear === currentYear && tMonth === currentMonth;
          case "last-month":
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return tYear === lastMonthYear && tMonth === lastMonth;
          case "last-3-months":
            const monthDiff = (currentYear - tYear) * 12 + (currentMonth - tMonth);
            return monthDiff >= 0 && monthDiff < 3;
          case "this-year":
            return tYear === currentYear;
          default:
            return true;
        }
      });
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, filters]);
}
