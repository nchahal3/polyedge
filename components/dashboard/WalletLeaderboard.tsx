"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletRow } from "./WalletRow";
import type { MockWallet } from "@/lib/mockData";

interface WalletLeaderboardProps {
  wallets: MockWallet[];
  loading?: boolean;
}

const HEADERS = ["", "#", "Wallet", "Win Rate", "Bets", "PnL", "Bot Score", "Active", "Streak", "Last Active", ""];

export function WalletLeaderboard({ wallets, loading }: WalletLeaderboardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  function goCompare() {
    router.push(`/dashboard/compare?ids=${selected.join(",")}`);
  }

  if (loading) {
    return (
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 border-b animate-pulse"
            style={{ borderColor: "#1e2533", backgroundColor: i % 2 === 0 ? "#0f1117" : "#0a0b0f" }}
          />
        ))}
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="rounded-xl border py-16 text-center" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
        <div className="text-4xl mb-3">🔍</div>
        <div className="text-sm" style={{ color: "#94a3b8" }}>No wallets match your filters.</div>
        <div className="text-xs mt-1" style={{ color: "#475569" }}>Try lowering the min win rate or raising the max bot score.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Compare bar */}
      {selected.length >= 2 && (
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3" style={{ backgroundColor: "rgba(0,230,160,0.08)", border: "1px solid rgba(0,230,160,0.2)" }}>
          <span className="text-sm font-mono" style={{ color: "#00e6a0" }}>
            {selected.length} wallets selected
          </span>
          <div className="flex gap-2">
            <button onClick={() => setSelected([])} className="text-xs px-3 py-1.5 rounded-lg font-mono" style={{ color: "#94a3b8", border: "1px solid #1e2533" }}>
              Clear
            </button>
            <button onClick={goCompare} className="text-xs px-3 py-1.5 rounded-lg font-mono font-bold" style={{ backgroundColor: "#00e6a0", color: "#000" }}>
              Compare →
            </button>
          </div>
        </div>
      )}
      {selected.length === 1 && (
        <div className="text-xs font-mono px-2 pb-2" style={{ color: "#475569" }}>Select 1 more wallet to compare (max 3)</div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1e2533" }}>
                {HEADERS.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#475569" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet, i) => (
                <WalletRow
                  key={wallet.id}
                  wallet={wallet}
                  rank={i + 1}
                  selected={selected.includes(wallet.id)}
                  onSelect={() => toggleSelect(wallet.id)}
                  compareDisabled={selected.length >= 3 && !selected.includes(wallet.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
