"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BotScoreBadge } from "@/components/ui/BotScoreBadge";
import { MOCK_WALLETS } from "@/lib/mockData";
import { truncateAddress, formatPnl, formatVolume, getWinRateColor, getBotBadge } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Link from "next/link";

const WALLET_COLORS = ["#00e6a0", "#4ecdc4", "#ffc542"];

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);
  const wallets = ids.map(id => MOCK_WALLETS.find(w => w.id === id)).filter(Boolean) as typeof MOCK_WALLETS;

  if (wallets.length < 2) {
    return (
      <div className="rounded-xl border py-20 text-center" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
        <div className="text-4xl mb-3">⚖️</div>
        <div className="text-base font-semibold mb-2" style={{ color: "#e2e8f0" }}>Select 2–3 wallets to compare</div>
        <div className="text-sm mb-6" style={{ color: "#94a3b8" }}>Use the checkboxes on the leaderboard to pick wallets, then click Compare.</div>
        <Link href="/dashboard" className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#00e6a0", color: "#000" }}>
          Back to Leaderboard
        </Link>
      </div>
    );
  }

  // Build overlapping chart data from snapshots
  const chartData = wallets[0].snapshots
    .filter((_, i) => i % 3 === 0)
    .map((snap, i) => {
      const point: Record<string, string | number> = {
        date: snap.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      wallets.forEach((w, wi) => {
        const s = w.snapshots.filter((_, si) => si % 3 === 0)[i];
        if (s) point[w.alias ?? truncateAddress(w.address)] = parseFloat(s.winRate.toFixed(1));
        void wi;
      });
      return point;
    });

  // Shared active bets (same marketId)
  const allTrades = wallets.flatMap(w => w.activeTrades.map(t => ({ ...t, walletAlias: w.alias ?? truncateAddress(w.address) })));
  const sharedMarkets = Object.entries(
    allTrades.reduce((acc, t) => {
      acc[t.marketId] = acc[t.marketId] ?? { title: t.marketTitle, wallets: [] };
      if (!acc[t.marketId].wallets.includes(t.walletAlias)) acc[t.marketId].wallets.push(t.walletAlias);
      return acc;
    }, {} as Record<string, { title: string; wallets: string[] }>)
  ).filter(([, v]) => v.wallets.length >= 2);

  const STAT_ROWS = [
    { label: "Win Rate",     render: (w: typeof MOCK_WALLETS[0]) => <span className="font-mono font-bold" style={{ color: getWinRateColor(w.winRate) }}>{w.winRate}%</span> },
    { label: "Total PnL",   render: (w: typeof MOCK_WALLETS[0]) => <span className="font-mono font-bold" style={{ color: w.pnl >= 0 ? "#00e6a0" : "#ff4757" }}>{formatPnl(w.pnl)}</span> },
    { label: "Resolved Bets", render: (w: typeof MOCK_WALLETS[0]) => <span className="font-mono" style={{ color: "#94a3b8" }}>{w.resolvedBets}</span> },
    { label: "Bot Score",   render: (w: typeof MOCK_WALLETS[0]) => <BotScoreBadge score={w.botScore} /> },
    { label: "Active Bets", render: (w: typeof MOCK_WALLETS[0]) => <span className="font-mono" style={{ color: "#4ecdc4" }}>{w.activeBets}</span> },
    { label: "Volume",      render: (w: typeof MOCK_WALLETS[0]) => <span className="font-mono" style={{ color: "#94a3b8" }}>{formatVolume(w.totalVolume)}</span> },
    { label: "Win Streak",  render: (w: typeof MOCK_WALLETS[0]) => <span className="font-mono" style={{ color: "#ffc542" }}>{w.winStreak > 0 ? `🔥 ${w.winStreak}` : "—"}</span> },
    { label: "Verified",    render: (w: typeof MOCK_WALLETS[0]) => <span style={{ color: w.verified ? "#00e6a0" : "#475569" }}>{w.verified ? "✓ Yes" : "No"}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Profile headers */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${wallets.length}, 1fr)` }}>
        {wallets.map((w, i) => (
          <div key={w.id} className="rounded-xl border p-4" style={{ borderColor: WALLET_COLORS[i] + "44", backgroundColor: "#0f1117" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${WALLET_COLORS[i]}33, ${WALLET_COLORS[i]}11)`, color: WALLET_COLORS[i] }}>
                {(w.alias ?? truncateAddress(w.address)).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: "#e2e8f0" }}>{w.alias ?? truncateAddress(w.address)}</div>
                <div className="text-xs font-mono" style={{ color: "#475569" }}>{truncateAddress(w.address)}</div>
              </div>
            </div>
            <Link href={`/dashboard/wallet/${w.id}`} className="text-xs font-mono" style={{ color: WALLET_COLORS[i] }}>
              View full profile →
            </Link>
          </div>
        ))}
      </div>

      {/* Stats table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
        <div className="px-5 py-3 border-b text-xs font-mono uppercase tracking-wider" style={{ borderColor: "#1e2533", color: "#475569" }}>
          Head-to-Head Stats
        </div>
        {STAT_ROWS.map(row => (
          <div key={row.label} className="flex border-b" style={{ borderColor: "#1e2533" }}>
            <div className="w-32 px-4 py-3 text-xs font-mono shrink-0" style={{ color: "#475569", backgroundColor: "#0a0b0f" }}>
              {row.label}
            </div>
            {wallets.map((w) => (
              <div key={w.id} className="flex-1 px-4 py-3 text-sm border-l" style={{ borderColor: "#1e2533" }}>
                {row.render(w)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Win rate chart overlay */}
      <div className="rounded-xl border p-5" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
        <div className="text-sm font-mono font-semibold uppercase tracking-wider mb-4" style={{ color: "#94a3b8" }}>Win Rate Over Time</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1e2533" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#475569", fontFamily: "JetBrains Mono" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#475569", fontFamily: "JetBrains Mono" }} tickLine={false} domain={[40, 100]} unit="%" />
            <Tooltip contentStyle={{ backgroundColor: "#0f1117", border: "1px solid #1e2533", borderRadius: "8px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "JetBrains Mono" }} />
            {wallets.map((w, i) => (
              <Line key={w.id} type="monotone" dataKey={w.alias ?? truncateAddress(w.address)} stroke={WALLET_COLORS[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Shared bets */}
      {sharedMarkets.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
          <div className="text-sm font-mono font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
            Shared Active Positions ({sharedMarkets.length})
          </div>
          <div className="space-y-2">
            {sharedMarkets.map(([id, { title, wallets: wNames }]) => (
              <div key={id} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}>
                <span className="text-sm" style={{ color: "#e2e8f0" }}>{title}</span>
                <div className="flex gap-1">
                  {wNames.map((name, i) => (
                    <span key={name} className="text-xs px-2 py-0.5 rounded font-mono" style={{ backgroundColor: "#161b27", color: WALLET_COLORS[i] ?? "#94a3b8", border: "1px solid #1e2533" }}>{name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: "#475569" }}>These wallets have open positions on the same markets — potential consensus forming.</p>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs font-mono" style={{ color: "#475569" }}>← Dashboard</Link>
            <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>Wallet Comparison</h1>
          </div>
          <Suspense fallback={<div style={{ color: "#475569" }} className="text-sm font-mono">Loading...</div>}>
            <CompareContent />
          </Suspense>
        </div>
      </DashboardLayout>
    </>
  );
}
