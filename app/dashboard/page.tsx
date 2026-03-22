"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { FilterControls, type FilterState } from "@/components/dashboard/FilterControls";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { WalletLeaderboard } from "@/components/dashboard/WalletLeaderboard";
import { ConsensusPanel } from "@/components/dashboard/ConsensusPanel";
import {
  getWalletsByCategory,
  getSignalsByCategory,
  MOCK_SIGNALS,
  CATEGORIES,
  type Category,
} from "@/lib/mockData";
import { OnboardingTour } from "@/components/OnboardingTour";

type ActiveCategory = Category | "all";

const SIGNAL_COUNTS: Partial<Record<ActiveCategory, number>> = {
  all: MOCK_SIGNALS.length,
  ...Object.fromEntries(
    CATEGORIES.map(cat => [cat, MOCK_SIGNALS.filter(s => s.category === cat).length])
  ),
};

export default function DashboardPage() {
  const [category, setCategory] = useState<ActiveCategory>("all");
  const [filters, setFilters] = useState<FilterState>({
    minWinRate: 70,
    maxBotScore: 25,
    topN: 10,
    sortBy: "winRate",
  });

  const wallets = useMemo(() => {
    const all = getWalletsByCategory(category, filters.maxBotScore, filters.minWinRate, 55);
    return [...all]
      .sort((a, b) => {
        if (filters.sortBy === "winRate") return b.winRate - a.winRate;
        if (filters.sortBy === "pnl") return b.pnl - a.pnl;
        return b.totalVolume - a.totalVolume;
      })
      .slice(0, filters.topN);
  }, [category, filters]);

  const signals = useMemo(() => getSignalsByCategory(category), [category]);
  const strongCount = signals.filter(s => s.tier === "STRONG").length;

  return (
    <>
      <OnboardingTour />
      <Header />
      <DashboardLayout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-5">
          {/* Category tabs */}
          <CategoryTabs active={category} onChange={setCategory} signalCounts={SIGNAL_COUNTS} />

          {/* Filters */}
          <FilterControls filters={filters} onChange={setFilters} />

          {/* Stats */}
          <StatsRow wallets={wallets} signals={signals} />

          {/* Main content: leaderboard + signals */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
            {/* Leaderboard */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2
                  className="text-sm font-semibold font-mono uppercase tracking-wider"
                  style={{ color: "#94a3b8" }}
                >
                  Wallet Leaderboard
                </h2>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#161b27", color: "#475569" }}
                >
                  {wallets.length} wallets
                </span>
                {category === "all" && (
                  <span className="text-xs font-mono" style={{ color: "#475569" }}>
                    · all categories
                  </span>
                )}
              </div>
              <WalletLeaderboard wallets={wallets} />
            </div>

            {/* Signals panel */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: strongCount > 0 ? "#ff4757" : "#ffc542",
                  }}
                />
                <h2
                  className="text-sm font-semibold font-mono uppercase tracking-wider"
                  style={{ color: "#94a3b8" }}
                >
                  Consensus Signals
                </h2>
                {strongCount > 0 && (
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: "rgba(255,71,87,0.15)", color: "#ff4757" }}
                  >
                    {strongCount} STRONG
                  </span>
                )}
              </div>
              <ConsensusPanel signals={signals} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
