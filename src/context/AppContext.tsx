"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { Transaction, Role } from "@/types";
import { initialTransactions } from "@/lib/mockData";

export interface AppState {
  transactions: Transaction[];
  role: Role;
}

export type AppAction =
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "EDIT_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "SET_ROLE"; payload: Role }
  | { type: "HYDRATE"; payload: AppState };

const initialState: AppState = {
  transactions: initialTransactions,
  role: "Admin",
};

function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case "ADD_TRANSACTION":
      newState = { ...state, transactions: [action.payload, ...state.transactions] };
      break;
    case "EDIT_TRANSACTION":
    case "UPDATE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
      break;
    case "DELETE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
      break;
    case "SET_ROLE":
      newState = { ...state, role: action.payload };
      break;
    case "HYDRATE":
      return action.payload; 
    default:
      return state;
  }
  
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("fintrack_state", JSON.stringify(newState));
    } catch (err) {
      console.error(err);
    }
  }
  
  return newState;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try { 
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("fintrack_state");
        if (saved) {
          const parsed: AppState = JSON.parse(saved);
        // If saved state has no transactions fall back to initialTransactions
        // so the dashboard always shows mock data on first load.
        if (!parsed.transactions || parsed.transactions.length === 0) {
          dispatch({
            type: "HYDRATE",
            payload: { ...parsed, transactions: initialTransactions },
          });
        } else {
          // Merge: keep saved transactions, then add any initialTransactions
          // whose id isn't already present (so mock rows are never lost).
          const savedIds = new Set(parsed.transactions.map((t) => t.id));
          const merged = [
            ...parsed.transactions,
            ...initialTransactions.filter((t) => !savedIds.has(t.id)),
          ];
          dispatch({
            type: "HYDRATE",
            payload: { ...parsed, transactions: merged },
          });
        }
      }
      }
    } catch (err) {
      console.error("Hydration failed", err);
      // If localStorage is corrupt, clear it so we start fresh next time
      if (typeof window !== "undefined") {
        localStorage.removeItem("fintrack_state");
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
