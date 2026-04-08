"use client";

import { useState, useRef, useEffect } from "react";

export default function ResponsiveTestSuite() {
  const [iframeWidth, setIframeWidth] = useState(1280);
  const [isSweeping, setIsSweeping] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const directionRef = useRef(1);
  const [path, setPath] = useState("/");
  const [issues, setIssues] = useState<{ id: string; msg: string; type: "overflow" | "tap" | "font" }[]>([]);

  // 1. Viewport Sweep Animate
  useEffect(() => {
    let animationFrameId: number;
    const sweep = () => {
      setIframeWidth((w) => {
        let next = w + directionRef.current * 8;
        if (next >= 2560) {
          next = 2560;
          directionRef.current = -1;
        } else if (next <= 320) {
          next = 320;
          directionRef.current = 1;
        }
        return next;
      });
      animationFrameId = requestAnimationFrame(sweep);
    };

    if (isSweeping) {
      animationFrameId = requestAnimationFrame(sweep);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSweeping]);

  // Detector Script Injection
  const runDetectors = () => {
    const doc = iframeRef.current?.contentWindow?.document;
    if (!doc) return;

    let newIssues: any[] = [];

    // Reset old highlights
    doc.querySelectorAll(".test-highlight-font").forEach((el) => {
      (el as HTMLElement).style.outline = "";
      (el as HTMLElement).classList.remove("test-highlight-font");
    });
    doc.querySelectorAll(".test-highlight-tap").forEach((el) => {
      (el as HTMLElement).style.outline = "";
      (el as HTMLElement).classList.remove("test-highlight-tap");
    });

    // 2. Overflow Detector
    doc.querySelectorAll("*").forEach((el) => {
      const e = el as HTMLElement;
      if (e.scrollWidth > Math.max(e.clientWidth, 0)) {
        // Exclude specific elements that are ALLOWED to scroll (e.g. wrapper divs)
        const parentW = e.parentElement?.clientWidth || 0;
        if (e.tagName !== "BODY" && e.tagName !== "HTML" && window.getComputedStyle(e).overflowX !== 'auto' && window.getComputedStyle(e).overflowX !== 'scroll') {
          // It's genuinely overflowing weirdly. Wait, let's only care about document overflow
          if (e.scrollWidth > doc.documentElement.clientWidth) {
              // strong overflow
              newIssues.push({ id: Math.random().toString(), msg: `Overflow: <${e.tagName.toLowerCase()}>`, type: "overflow" });
          }
        }
      }
    });

    // 3. Font Size Checker
    // Checking all text nodes is heavy, let's quickly check elements
    doc.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6, a, button, td, th").forEach((el) => {
      const e = el as HTMLElement;
      if (e.innerText?.trim()) {
        const size = parseFloat(window.getComputedStyle(e).fontSize);
        if (size < 14) { // MUST be at least 14px
          e.style.outline = "2px solid yellow";
          e.classList.add("test-highlight-font");
          newIssues.push({ id: Math.random().toString(), msg: `Font < 14px: ${size.toFixed(1)}px`, type: "font" });
        }
      }
    });

    // 4. Tap Target Checker
    doc.querySelectorAll("a, button, input, select, .cursor-pointer").forEach((el) => {
      const e = el as HTMLElement;
      const rect = e.getBoundingClientRect();
      if ((rect.width > 0 && rect.width < 44) || (rect.height > 0 && rect.height < 44)) {
        e.style.outline = "2px solid red";
        e.classList.add("test-highlight-tap");
        newIssues.push({ id: Math.random().toString(), msg: `Tap target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}`, type: "tap" });
      }
    });

    // Deduplicate array
    const dedupedMsg = Array.from(new Set(newIssues.map(a => a.msg)))
      .map(msg => newIssues.find(a => a.msg === msg));
    setIssues(dedupedMsg as any);
  };

  // Run detectors every 1.5s
  useEffect(() => {
    const i = setInterval(runDetectors, 1500);
    return () => clearInterval(i);
  }, []);

  const getBreakpoint = (w: number) => {
    if (w < 480) return "xs";
    if (w < 768) return "sm";
    if (w < 1024) return "md";
    if (w < 1280) return "lg";
    return "xl";
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Test Panel Sidebar */}
      <div className="w-[300px] border-r border-white/10 bg-[#111111] p-5 flex flex-col h-full overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Responsive Test Suite</h1>
        
        {/* Controls */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-gray-400 uppercase font-mono tracking-widest block mb-2">Target Route</label>
            <select value={path} onChange={e => setPath(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-sm">
              <option value="/">Desktop (/) </option>
              <option value="/transactions">Transactions</option>
              <option value="/insights">Insights</option>
              <option value="/categories">Categories</option>
              <option value="/reports">Reports</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase font-mono tracking-widest block mb-2">Live Viewport</label>
            <div className="flex items-center gap-2 bg-black border border-white/20 rounded p-2 text-sm font-mono tracking-widest">
              <span>{Math.round(iframeWidth)}px</span>
              <span className="text-[#2ec4b6] ml-auto font-bold">{getBreakpoint(iframeWidth)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsSweeping(!isSweeping)}
            className="w-full py-2 bg-[#2ec4b6] text-black font-bold rounded"
          >
            {isSweeping ? "Stop Sweep" : "Start Auto-Sweep (320px-2560px)"}
          </button>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="text-xs text-gray-400 uppercase font-mono tracking-widest block mb-2">Presets</label>
          <div className="flex flex-wrap gap-2">
            {[320, 375, 428, 768, 1024, 1280, 1440, 1920].map(w => (
              <button 
                key={w} 
                onClick={() => { setIframeWidth(w); setIsSweeping(false); }}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs hover:bg-white/20"
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Console / Issues */}
        <div className="flex-1 flex flex-col border border-white/10 rounded bg-black">
          <div className="bg-white/10 px-3 py-1 text-xs uppercase font-mono">Detector Output ({issues.length})</div>
          <div className="p-3 flex-1 overflow-y-auto space-y-1 text-xs font-mono">
            {issues.map(i => (
              <div key={i.id} className={i.type === "tap" ? "text-red-400" : i.type === "font" ? "text-yellow-400" : "text-orange-400"}>
                • {i.msg}
              </div>
            ))}
            {issues.length === 0 && <div className="text-green-400 text-center mt-10">Pass! ZERO violations</div>}
          </div>
        </div>
      </div>

      {/* Viewport Render Area */}
      <div className="flex-1 bg-zinc-900 flex justify-center items-center overflow-x-auto relative">
        <div 
          className="border border-[#2ec4b6]/50 shadow-2xl transition-[width] shadow-[#2ec4b6]/10 relative h-[95%]"
          style={{ width: `${iframeWidth}px`, minWidth: '320px' }}
        >
          {/* Mock hardware overlay wrapper */}
          <div className="w-full h-4 bg-black flex items-center justify-center border-b border-white/10">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <iframe
            ref={iframeRef}
            src={path}
            className="w-full h-[calc(100%-16px)] bg-black"
          />
        </div>
      </div>
    </div>
  );
}
