"use client";
import { useState } from "react";

export interface FilterState {
  minWinRate: number;
  maxBotScore: number;
  topN: number;
  sortBy: "winRate" | "pnl" | "volume";
}

interface FilterControlsProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

export function FilterControls({ filters, onChange }: FilterControlsProps) {
  const [open, setOpen] = useState(true);

  function update(key: keyof FilterState, val: number | string) {
    onChange({ ...filters, [key]: val });
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        style={{ color: "#e2e8f0" }}
      >
        <span className="flex items-center gap-2">
          <span style={{ color: "#00e6a0" }}>⚙</span>
          Filter Controls
        </span>
        <span style={{ color: "#475569", fontSize: "10px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t"
          style={{ borderColor: "#1e2533" }}
        >
          {/* Min Win Rate */}
          <div className="pt-3">
            <label className="text-xs font-mono mb-2 block" style={{ color: "#94a3b8" }}>
              MIN WIN RATE
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={50}
                max={95}
                step={5}
                value={filters.minWinRate}
                onChange={e => update("minWinRate", Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <span className="font-mono text-sm font-semibold w-10 text-right" style={{ color: "#00e6a0" }}>
                {filters.minWinRate}%
              </span>
            </div>
          </div>

          {/* Max Bot Score */}
          <div className="pt-3">
            <label className="text-xs font-mono mb-2 block" style={{ color: "#94a3b8" }}>
              MAX BOT SCORE
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={filters.maxBotScore}
                onChange={e => update("maxBotScore", Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <span className="font-mono text-sm font-semibold w-8 text-right" style={{ color: "#ffc542" }}>
                {filters.maxBotScore}
              </span>
            </div>
          </div>

          {/* Top N */}
          <div className="pt-3">
            <label className="text-xs font-mono mb-2 block" style={{ color: "#94a3b8" }}>
              TOP N WALLETS
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={filters.topN}
                onChange={e => update("topN", Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <span className="font-mono text-sm font-semibold w-8 text-right" style={{ color: "#4ecdc4" }}>
                {filters.topN}
              </span>
            </div>
          </div>

          {/* Sort By */}
          <div className="pt-3">
            <label className="text-xs font-mono mb-2 block" style={{ color: "#94a3b8" }}>
              SORT BY
            </label>
            <select
              value={filters.sortBy}
              onChange={e => update("sortBy", e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm font-mono outline-none"
              style={{
                backgroundColor: "#161b27",
                border: "1px solid #1e2533",
                color: "#e2e8f0",
              }}
            >
              <option value="winRate">Win Rate</option>
              <option value="pnl">PnL</option>
              <option value="volume">Total Volume</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
