"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WalletLeaderboard } from "@/components/dashboard/WalletLeaderboard";
import { getWatchlist } from "@/lib/watchlist";
import { MOCK_WALLETS } from "@/lib/mockData";
import Link from "next/link";

export default function WatchlistPage() {
  const [walletIds, setWalletIds] = useState<string[]>([]);

  useEffect(() => {
    setWalletIds(getWatchlist());
  }, []);

  const wallets = MOCK_WALLETS.filter(w => walletIds.includes(w.id));

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>My Watchlist</h1>
            <p className="text-sm mt-1" style={{ color: "#475569" }}>
              {wallets.length} wallet{wallets.length !== 1 ? "s" : ""} saved · updates when they place new bets
            </p>
          </div>

          {wallets.length === 0 ? (
            <div className="rounded-xl border py-20 text-center" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
              <div className="text-4xl mb-3">☆</div>
              <div className="text-base font-semibold mb-2" style={{ color: "#e2e8f0" }}>No wallets saved yet</div>
              <div className="text-sm mb-6" style={{ color: "#94a3b8" }}>
                Star any wallet from the leaderboard or wallet detail page to track it here.
              </div>
              <Link
                href="/dashboard"
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "#00e6a0", color: "#000" }}
              >
                Browse Leaderboard
              </Link>
            </div>
          ) : (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "WATCHED WALLETS", value: wallets.length.toString(), color: "#4ecdc4" },
                  { label: "AVG WIN RATE", value: `${(wallets.reduce((s, w) => s + w.winRate, 0) / wallets.length).toFixed(1)}%`, color: "#00e6a0" },
                  { label: "ACTIVE BETS", value: wallets.reduce((s, w) => s + w.activeBets, 0).toString(), color: "#ffc542" },
                  { label: "TOTAL PnL", value: `${wallets.reduce((s, w) => s + w.pnl, 0) >= 0 ? "+" : ""}$${Math.abs(Math.round(wallets.reduce((s, w) => s + w.pnl, 0) / 1000))}k`, color: "#00e6a0" },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-4 border" style={{ backgroundColor: "#0f1117", borderColor: "#1e2533" }}>
                    <div className="text-xs font-mono mb-1" style={{ color: "#475569" }}>{stat.label}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Watched wallets table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-mono font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                    Watched Wallets
                  </h2>
                </div>
                <WalletLeaderboard wallets={wallets} />
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
