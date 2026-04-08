"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { Menu, X } from "lucide-react";

const mainNav = [
  { name: "Overview", href: "/" },
  { name: "Transactions", href: "/transactions" },
  { name: "Insights", href: "/insights" },
];

const manageNav = [
  { name: "Categories", href: "/categories" },
  { name: "Reports", href: "/reports" },
];

const fmt = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const { state } = useAppContext();
  const { transactions } = state;

  const now = new Date();

  const thisMonthTxns = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions]
  );

  const totalIn = useMemo(
    () =>
      thisMonthTxns
        .filter((t) => t.type === "credit")
        .reduce((s, t) => s + t.amount, 0),
    [thisMonthTxns]
  );

  const totalOut = useMemo(
    () =>
      thisMonthTxns
        .filter((t) => t.type === "debit")
        .reduce((s, t) => s + t.amount, 0),
    [thisMonthTxns]
  );

  const netSaved = totalIn - totalOut;
  const total = totalIn + totalOut;

  const displayRate = useMemo(
    () =>
      total > 0
        ? Math.min(100, Math.max(0, Math.round((netSaved / total) * 100)))
        : 0,
    [netSaved, total]
  );

  const count = transactions.length;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-[clamp(1.5rem,4vw,2rem)] left-[clamp(1rem,3vw,1.5rem)] z-50 p-2 text-foreground bg-[#111111] border border-white/[0.1] rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "w-full max-w-[280px] border-r border-border min-h-[100svh] flex flex-col pt-8 pb-6 px-[clamp(0.875rem,2vw,1.5rem)] bg-background/95 backdrop-blur-md z-50 transition-transform duration-300",
          "fixed inset-y-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:sticky md:top-0 md:translate-x-0 md:bg-background/50"
        )}
      >
        <div className="flex items-center gap-3 mb-12 ml-10 md:ml-0">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 bg-accent rounded-full opacity-80 mix-blend-screen" />
            <div className="absolute top-1 left-1.5 w-6 h-6 bg-accent rounded-full opacity-60 mix-blend-screen" />
          </div>
          <span className="font-bold text-xl tracking-tight">FinTrack</span>
        </div>

      <nav className="flex-1 space-y-8">
        <div>
          <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-bold text-muted uppercase tracking-[0.2em] mb-4">Main</p>
          <ul className="space-y-2">
            {mainNav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "relative w-full flex items-center justify-between px-[clamp(0.5rem,1.5vw,1rem)] py-3 text-sm rounded-full transition-all duration-300",
                      active
                        ? "text-background bg-foreground font-semibold"
                        : "text-muted hover:text-foreground hover:bg-secondary-100"
                    )}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {item.name === "Transactions" && (
                      <span
                        className={cn(
                          "text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] z-10 px-1.5 py-0.5 rounded-full font-mono",
                          active
                            ? "bg-background/20 text-background"
                            : "bg-accent/10 text-accent"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-bold text-muted uppercase tracking-[0.2em] mb-4">Manage</p>
          <ul className="space-y-2">
            {manageNav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "relative w-full flex items-center justify-between px-[clamp(0.5rem,1.5vw,1rem)] py-3 text-sm rounded-full transition-all duration-300",
                      active
                        ? "text-background bg-foreground font-semibold"
                        : "text-muted hover:text-foreground hover:bg-secondary-100"
                    )}
                  >
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Status Card */}
      <div className="mt-auto bg-[#111111] border border-white/[0.06] rounded-2xl p-3.5">
        {thisMonthTxns.length === 0 ? (
          <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#4a5068] text-center py-3">No activity yet</p>
        ) : (
          <>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[clamp(0.875rem,0.5vw+0.7rem,0.875rem)] font-mono uppercase tracking-[0.15em] text-[#9ca3af]">
                This Month
              </span>
              <span className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono text-accent">
                {displayRate}% saved
              </span>
            </div>

            {/* Saved / Deficit row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: netSaved >= 0 ? "#2ec4b6" : "#f87171" }}
                />
                <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">
                  {netSaved >= 0 ? "Saved" : "Deficit"}
                </span>
              </div>
              <span
                className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono"
                style={{ color: netSaved >= 0 ? "#2ec4b6" : "#f87171" }}
              >
                {fmt(Math.abs(netSaved))}
              </span>
            </div>

            {/* Spent row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                <span className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#9ca3af]">Spent</span>
              </div>
              <span className="text-[clamp(0.875rem,1vw+0.5rem,1rem)] font-mono text-[#f87171]">{fmt(totalOut)}</span>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-white/[0.06] rounded-sm overflow-hidden">
              <motion.div
                className="h-full rounded-sm"
                style={{ backgroundColor: netSaved >= 0 ? "#2ec4b6" : "#f87171" }}
                initial={{ width: 0 }}
                animate={{ width: `${displayRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </>
        )}
      </div>
    </aside>
    </>
  );
}
