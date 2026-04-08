"use client";

import { Bell } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Role } from "@/types";

export function Navbar() {
  const { state, dispatch } = useAppContext();

  return (
    <header className="flex justify-between items-center w-full py-8 px-[clamp(1rem,3vw,2.5rem)]">
      {/* Mobile Title */}
      <div className="md:hidden flex items-center gap-2 pl-[4.5rem]">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 bg-accent rounded-full opacity-80 mix-blend-screen" />
          <div className="absolute top-1 left-1 w-5 h-5 bg-accent rounded-full opacity-60 mix-blend-screen" />
        </div>
        <span className="font-bold text-lg tracking-tight">InEx</span>
      </div>

      <div className="flex items-center gap-[clamp(0.5rem,2vw,1.5rem)] ml-auto">
        <select
          value={state.role}
          onChange={(e) => dispatch({ type: "SET_ROLE", payload: e.target.value as Role })}
          className="bg-transparent border border-border text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-bold text-foreground px-2 md:px-4 py-2 min-h-[44px] rounded-full outline-none focus:border-accent cursor-pointer uppercase tracking-[0.1em]"
        >
          <option value="Admin" className="bg-background text-foreground">Admin</option>
          <option value="Viewer" className="bg-background text-foreground">Viewer</option>
        </select>
        
        <button className="relative p-3 min-h-[44px] min-w-[44px] text-muted hover:text-foreground transition-colors group flex items-center justify-center">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-[2px] border-background" />
        </button>
        <button className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-accent text-background flex items-center justify-center font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_15px_rgba(46,196,182,0.3)]">
          J
        </button>
      </div>
    </header>
  );
}
