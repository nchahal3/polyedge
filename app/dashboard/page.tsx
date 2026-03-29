"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { FilterControls, type FilterState } from "@/components/dashboard/FilterControls";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { WalletLeaderboard } from "@/components/dashboard/WalletLeaderboard";
import { ConsensusPanel } from "@/components/dashboard/ConsensusPanel";
import { CATEGORIES, type Category, type MockWallet, type MockSignal } from "@/lib/mockData";
import { OnboardingTour } from "@/components/OnboardingTour";
import { trpc } from "@/lib/trpc";

type ActiveCategory = Category | "all";

// Adapt real wallet data to MockWallet shape for existing components
function adaptWallet(w: Record<string, unknown>): MockWallet {
  return {
    id: String(w.id ?? w.address ?? ""),
    address: String(w.address ?? ""),
    alias: (w.alias as string | null) ?? null,
    verified: false,
    botScore: Number(w.botScore ?? 50),
    winRate: Math.round(Number(w.winRate ?? 0) * 1000) / 10,
    totalBets: Number(w.totalBets ?? 0),
    resolvedBets: Number(w.resolvedBets ?? 0),
    pnl: Number(w.pnl ?? 0),
    totalVolume: Number(w.totalVolume ?? 0),
    activeBets: Number(w.activeBets ?? 0),
    winStreak: Number(w.winStreak ?? 0),
    lastActive: w.lastActive ? new Date(String(w.lastActive)) : new Date(),
    categories: (w.categories as Category[]) ?? [],
    activeTrades: ((w.activeTrades as unknown[]) ?? []).map((t: unknown) => {
      const trade = t as Record<string, unknown>;
      return {
        marketId: String(trade.marketId ?? ""),
        marketTitle: String(trade.marketTitle ?? ""),
        polymarketUrl: String(trade.polymarketUrl ?? "https://polymarket.com/markets"),
        outcome: "YES" as const,
        odds: Number(trade.odds ?? 0.5),
        amount: Number(trade.size ?? 0),
        category: ((w.primaryCategory as Category) ?? "Crypto"),
      };
    }),
    snapshots: [],
    botBreakdown: {
      timing: Number((w.botBreakdown as Record<string, unknown>)?.timing ?? 10),
      sizing: Number((w.botBreakdown as Record<string, unknown>)?.sizing ?? 10),
      speed: Number((w.botBreakdown as Record<string, unknown>)?.speed ?? 10),
      diversity: Number((w.botBreakdown as Record<string, unknown>)?.diversity ?? 10),
      gas: 10,
      volumeParadox: Number((w.botBreakdown as Record<string, unknown>)?.volumeParadox ?? 10),
    },
    tradeHistory: [],
    categoryBreakdown: ((w.categoryBreakdown as unknown[]) ?? []).map((c: unknown) => {
      const cb = c as Record<string, unknown>;
      return {
        category: String(cb.category ?? "Other") as Category,
        pct: Number(cb.pct ?? 0),
        bets: Number(cb.bets ?? 0),
      };
    }),
  };
}

// Adapt real signal data to MockSignal shape
function adaptSignal(s: Record<string, unknown>): MockSignal {
  return {
    id: String(s.id ?? ""),
    marketId: String(s.marketId ?? ""),
    marketTitle: String(s.marketTitle ?? ""),
    polymarketUrl: String(s.polymarketUrl ?? "https://polymarket.com/markets"),
    outcome: "YES" as const,
    category: (s.category as Category) ?? "Crypto",
    strength: Number(s.strength ?? 0),
    tier: (s.tier as "STRONG" | "MODERATE" | "WEAK") ?? "WEAK",
    walletCount: Number(s.walletCount ?? 0),
    totalWallets: Number(s.totalWallets ?? 0),
    currentOdds: Number(s.avgOdds ?? 0.5),
    totalVolume: Number(s.totalVolume ?? 0),
    walletAliases: (s.wallets as string[]) ?? [],
    formedAt: s.createdAt ? new Date(String(s.createdAt)) : new Date(),
  };
}

export default function DashboardPage() {
  const [category, setCategory] = useState<ActiveCategory>("all");
  const [filters, setFilters] = useState<FilterState>({
    minWinRate: 55,
    maxBotScore: 40,
    topN: 10,
    sortBy: "winRate",
  });

  const walletsQuery = trpc.wallets.getAll.useQuery({
    category,
    maxBotScore: filters.maxBotScore,
    minWinRate: filters.minWinRate,
    topN: filters.topN,
    sortBy: filters.sortBy,
  });

  const signalsQuery = trpc.signals.getAll.useQuery({
    category,
    minStrength: 0.3,
    minWinRate: filters.minWinRate,
    maxBotScore: filters.maxBotScore,
    topN: filters.topN,
  });

  const wallets: MockWallet[] = useMemo(
    () => (walletsQuery.data ?? []).map((w) => adaptWallet(w as unknown as Record<string, unknown>)),
    [walletsQuery.data]
  );

  const signals: MockSignal[] = useMemo(
    () => (signalsQuery.data ?? []).map((s) => adaptSignal(s as unknown as Record<string, unknown>)),
    [signalsQuery.data]
  );

  const strongCount = signals.filter((s) => s.tier === "STRONG").length;

  const signalCounts: Partial<Record<ActiveCategory, number>> = useMemo(() => ({
    all: signals.length,
    ...Object.fromEntries(
      CATEGORIES.map((cat) => [cat, signals.filter((s) => s.category === cat).length])
    ),
  }), [signals]);

  const isLoading = walletsQuery.isLoading || signalsQuery.isLoading;

  return (
    <>
      <OnboardingTour />
      <Header />
      <DashboardLayout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-5">
          <CategoryTabs active={category} onChange={setCategory} signalCounts={signalCounts} />
          <FilterControls filters={filters} onChange={setFilters} />
          <StatsRow wallets={wallets} signals={signals} />

          {isLoading && (
            <div className="text-center py-12 font-mono text-sm" style={{ color: "#475569" }}>
              <div className="animate-pulse">Fetching live Polymarket data…</div>
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold font-mono uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                    Wallet Leaderboard
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "#161b27", color: "#475569" }}>
                    {wallets.length} wallets
                  </span>
                  {category === "all" && (
                    <span className="text-xs font-mono" style={{ color: "#475569" }}>· all categories</span>
                  )}
                </div>
                <WalletLeaderboard wallets={wallets} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: strongCount > 0 ? "#ff4757" : "#ffc542" }} />
                  <h2 className="text-sm font-semibold font-mono uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                    Consensus Signals
                  </h2>
                  {strongCount > 0 && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded font-bold" style={{ backgroundColor: "rgba(255,71,87,0.15)", color: "#ff4757" }}>
                      {strongCount} STRONG
                    </span>
                  )}
                </div>
                <ConsensusPanel signals={signals} />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
