"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";

const COLOR_SWATCHES = [
  "#2ec4b6", "#4ade80", "#f87171", "#a78bfa",
  "#fb923c", "#f59e0b", "#60a5fa", "#e879f9",
];

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

interface CategoryColorModalProps {
  categoryName: string;
  currentColor: string;
  Icon: LucideIcon;
  onClose: () => void;
  onSave: (color: string) => void;
}

export function CategoryColorModal({
  categoryName,
  currentColor,
  Icon,
  onClose,
  onSave,
}: CategoryColorModalProps) {
  const [previewColor, setPreviewColor] = useState(currentColor);
  const [hexInput, setHexInput] = useState(currentColor);
  const [hexError, setHexError] = useState(false);

  const applyColor = (hex: string) => {
    setPreviewColor(hex);
    setHexInput(hex);
    setHexError(false);
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    const normalized = val.startsWith("#") ? val : `#${val}`;
    if (HEX_REGEX.test(normalized)) {
      setPreviewColor(normalized);
      setHexError(false);
    } else {
      setHexError(true);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-[min(90vw,400px)]"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            backgroundColor: "#111111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 24,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[clamp(1rem,1.8vw+0.5rem,1.25rem)] font-semibold text-white">Edit {categoryName}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Preview icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              animate={{ backgroundColor: previewColor + "28" }}
              transition={{ duration: 0.15 }}
            >
              <Icon size={28} style={{ color: previewColor }} />
            </motion.div>
          </div>

          {/* Label */}
          <p className="text-[clamp(0.875rem,0.6vw+0.7rem,0.875rem)] font-mono font-bold uppercase tracking-[0.2em] text-[#9ca3af] mb-3">
            Accent Color
          </p>

          {/* Color swatches */}
          <div className="flex gap-2.5 flex-wrap mb-5">
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected = previewColor.toLowerCase() === swatch.toLowerCase();
              return (
                <button
                  key={swatch}
                  onClick={() => applyColor(swatch)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: swatch }}
                  aria-label={swatch}
                >
                  {isSelected && (
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow: `0 0 0 2px #0a0a0a, 0 0 0 4px ${swatch}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hex input */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 mb-6"
            style={{
              backgroundColor: "#0a0a0a",
              border: `1px solid ${hexError ? "#f87171" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8,
            }}
          >
            {/* Color dot preview */}
            <div
              className="w-4 h-4 rounded-full shrink-0 transition-colors"
              style={{ backgroundColor: previewColor }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] text-white font-mono"
              maxLength={7}
              spellCheck={false}
              placeholder="#000000"
            />
          </div>

          {hexError && (
            <p className="text-[clamp(0.875rem,0.8vw+0.7rem,0.9rem)] text-[#f87171] -mt-4 mb-4">Enter a valid hex color (e.g. #2ec4b6)</p>
          )}

          {/* Footer */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] font-semibold text-[#9ca3af] border border-white/[0.08] hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (!hexError) onSave(previewColor); }}
              disabled={hexError}
              className="flex-1 py-2.5 rounded-xl text-[clamp(0.875rem,1.2vw+0.5rem,1.05rem)] font-semibold text-background bg-accent hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Save changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
