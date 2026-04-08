export type Category = "Housing" | "Food" | "Transport" | "Income" | "Utilities" | "Other";

export interface Transaction {
  id: string;
  merchant: string;
  subtext: string;
  category: Category;
  date: string; // ISO string YYYY-MM-DD
  type: "credit" | "debit";
  amount: number; // always positive
  notes?: string;
}

export type Role = "Admin" | "Viewer";
