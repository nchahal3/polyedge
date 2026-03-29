"use client";
import { use, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BotScoreBadge } from "@/components/ui/BotScoreBadge";
import { WatchButton } from "@/components/ui/WatchButton";
import { trpc } from "@/lib/trpc";
import {
  truncateAddress,
  formatPnl,
  formatVolume,
  timeAgo,
  getWinRateColor,
  getBotBadge,
} from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BOT_HEURISTICS = [
  {
    key: "timing" as const,
    label: "Timing Regularity",
    desc: "Bots trade at exact intervals. Irregular timing = human.",
  },
  {
    key: "sizing" as const,
    label: "Position Sizing",
    desc: "Bots use identical sizes >80% of trades.",
  },
  {
    key: "speed" as const,
    label: "Execution Speed",
    desc: "Millisecond-level execution after market creation.",
  },
  {
    key: "diversity" as const,
    label: "Category Diversity",
    desc: "Narrow single-market focus is suspicious.",
  },
  {
    key: "gas" as const,
    label: "Gas Price Patterns",
    desc: "Automated gas pricing strategies signal bots.",
  },
  {
    key: "volumeParadox" as const,
    label: "Volume Paradox",
    desc: "Very high win rate on huge volume = likely exploiting.",
  },
];

const CAT_COLORS = ["#00e6a0", "#4ecdc4", "#ffc542", "#ff6b35", "#8b5cf6", "#3b82f6"];
const TRADES_PER_PAGE = 10;

export default function WalletDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: wallet, isLoading, isError } = trpc.wallets.getById.useQuery({ id });
  const [tradePage, setTradePage] = useState(0);

  if (isLoading) {
    return (
      <>
        <Header />
        <DashboardLayout>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="text-center py-24 font-mono text-sm animate-pulse" style={{ color: "#475569" }}>
              Loading wallet profile…
            </div>
          </div>
        </DashboardLayout>
      </>
    );
  }

  if (isError || !wallet) {
    return (
      <>
        <Header />
        <DashboardLayout>
          <div className="max-w-[1200px] mx-auto px-4 py-6 text-center py-24">
            <p className="font-mono text-sm mb-4" style={{ color: "#ff4757" }}>
              Wallet not found or failed to load.
            </p>
            <Link href="/dashboard" className="text-xs font-mono underline" style={{ color: "#475569" }}>
              ← Back to dashboard
            </Link>
          </div>
        </DashboardLayout>
      </>
    );
  }

  const winRateDisplay = Math.round((wallet.winRate as number) * 100);
  const winRateColor = getWinRateColor(winRateDisplay);
  const botBadge = getBotBadge(wallet.botScore as number);

  const botBreakdown = (wallet.botBreakdown ?? {}) as unknown as Record<string, number>;
  const categoryBreakdown = ((wallet.categoryBreakdown ?? []) as Array<{ category: string; pct: number; bets: number }>)
    .map(c => ({ ...c, pct: Math.round(c.pct * 100) }));

  const activeTrades = (wallet.activeTrades ?? []) as Array<{
    marketId: string;
    marketTitle: string;
    polymarketUrl: string;
    outcome: string;
    odds: number;
    size: number;
    pnl: number;
  }>;

  const tradeHistory = (wallet.tradeHistory ?? []) as Array<{
    id: string;
    marketTitle: string;
    outcome: string;
    amount: number;
    result: string;
    pnl: number;
    date: string;
  }>;

  const pagedTrades = tradeHistory.slice(tradePage * TRADES_PER_PAGE, (tradePage + 1) * TRADES_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(tradeHistory.length / TRADES_PER_PAGE));

  const alias = (wallet.alias as string | null) ?? null;
  const address = wallet.address as string;

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "#475569" }}>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <span>›</span>
            <span style={{ color: "#94a3b8" }}>
              {alias ?? truncateAddress(address)}
            </span>
          </div>

          {/* Profile header */}
          <div className="rounded-xl border p-5" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
            <div className="flex flex-wrap items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${winRateColor}33, ${winRateColor}11)`,
                  color: winRateColor,
                }}
              >
                {(alias ?? truncateAddress(address)).charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>
                    {alias ?? truncateAddress(address)}
                  </h1>
                  <BotScoreBadge score={wallet.botScore as number} />
                  <WatchButton walletId={wallet.id as string} size="md" />
                </div>
                <div className="text-sm font-mono truncate" style={{ color: "#475569" }}>
                  {address}
                </div>
                <div className="text-xs mt-1" style={{ color: "#475569" }}>
                  Last active {timeAgo(new Date(wallet.lastActive as string))}
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                {[
                  { label: "WIN RATE", value: `${winRateDisplay}%`, color: winRateColor },
                  { label: "TOTAL PnL", value: formatPnl(wallet.pnl as number), color: (wallet.pnl as number) >= 0 ? "#00e6a0" : "#ff4757" },
                  { label: "RESOLVED BETS", value: String(wallet.resolvedBets ?? 0), color: "#4ecdc4" },
                  { label: "VOLUME", value: formatVolume(wallet.totalVolume as number), color: "#94a3b8" },
                ].map(stat => (
                  <div key={stat.label} className="text-right">
                    <div className="text-xs font-mono" style={{ color: "#475569" }}>{stat.label}</div>
                    <div className="text-lg font-mono font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active positions */}
          {activeTrades.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "#1e2533" }}>
                <h3 className="text-sm font-mono font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                  Active Positions ({activeTrades.length})
                </h3>
              </div>
              <div className="divide-y" style={{ borderColor: "#1e2533" }}>
                {activeTrades.map((trade) => (
                  <div key={trade.marketId} className="px-5 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <a
                        href={trade.polymarketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm truncate block hover:underline"
                        style={{ color: "#e2e8f0" }}
                      >
                        {trade.marketTitle} ↗
                      </a>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-mono font-bold" style={{ color: trade.outcome === "Yes" ? "#00e6a0" : "#ff4757" }}>
                          {trade.outcome}
                        </span>
                        <span className="text-xs font-mono" style={{ color: "#475569" }}>
                          {Math.round(trade.odds * 100)}¢
                        </span>
                        <span className="text-xs font-mono" style={{ color: "#475569" }}>
                          ${trade.size.toFixed(2)} size
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-bold" style={{ color: trade.pnl >= 0 ? "#00e6a0" : "#ff4757" }}>
                        {formatPnl(trade.pnl)}
                      </div>
                      <div className="text-xs font-mono" style={{ color: "#475569" }}>unrealized PnL</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Category breakdown */}
            <div className="rounded-xl border p-5" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
              <h3 className="text-sm font-mono font-semibold uppercase tracking-wider mb-4" style={{ color: "#94a3b8" }}>
                Category Breakdown
              </h3>
              {categoryBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={categoryBreakdown} dataKey="bets" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                        {categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f1117", border: "1px solid #1e2533", borderRadius: "8px", fontSize: "11px" }}
                        formatter={(_v: unknown, _n: unknown, p: { payload?: { pct: number; category: string } }) =>
                          [`${p.payload?.pct}%`, p.payload?.category]
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {categoryBreakdown.map((c, i) => (
                      <div key={c.category} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                          <span style={{ color: "#94a3b8" }}>{c.category}</span>
                        </div>
                        <span className="font-mono" style={{ color: "#475569" }}>{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs font-mono text-center py-8" style={{ color: "#475569" }}>No category data</div>
              )}
            </div>

            {/* Win rate placeholder chart */}
            <div className="md:col-span-2 rounded-xl border p-5" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
              <h3 className="text-sm font-mono font-semibold uppercase tracking-wider mb-4" style={{ color: "#94a3b8" }}>
                Performance Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Bets", value: String(wallet.activeBets ?? 0), color: "#ffc542" },
                  { label: "Total Bets", value: String(wallet.totalBets ?? 0), color: "#94a3b8" },
                  { label: "Win Streak", value: String(wallet.winStreak ?? 0), color: "#00e6a0" },
                  { label: "Bot Score", value: `${wallet.botScore}/100`, color: botBadge.color },
                ].map(s => (
                  <div key={s.label} className="rounded-lg p-3" style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}>
                    <div className="text-xs font-mono mb-1" style={{ color: "#475569" }}>{s.label}</div>
                    <div className="text-xl font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bot detection breakdown */}
          <div className="rounded-xl border p-5" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-mono font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                Bot Detection Analysis
              </h3>
              <BotScoreBadge score={wallet.botScore as number} />
              <span className="text-sm font-mono font-bold" style={{ color: botBadge.color }}>
                Overall: {wallet.botScore}/100
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {BOT_HEURISTICS.map(h => {
                const score = h.key === "gas" ? 0 : (botBreakdown[h.key] ?? 0);
                const { color } = getBotBadge(score);
                return (
                  <div key={h.key} className="rounded-lg p-3" style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>{h.label}</span>
                      <span className="text-xs font-mono font-bold" style={{ color }}>{score}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "#1e2533" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-xs" style={{ color: "#475569" }}>{h.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade history */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "#1e2533" }}>
              <h3 className="text-sm font-mono font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                Trade History {tradeHistory.length > 0 && `(${tradeHistory.length})`}
              </h3>
            </div>
            {tradeHistory.length === 0 ? (
              <div className="text-center py-10 text-xs font-mono" style={{ color: "#475569" }}>
                No trade history available for this wallet.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "#1e2533" }}>
                        {["Market", "Outcome", "Amount", "Result", "PnL", "Date"].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#475569" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedTrades.map(trade => (
                        <tr key={trade.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "#1e2533" }}>
                          <td className="px-4 py-2.5 text-xs" style={{ color: "#e2e8f0", maxWidth: "260px" }}>
                            <span className="block truncate">{trade.marketTitle}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-mono font-bold" style={{ color: "#94a3b8" }}>{trade.outcome}</span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "#94a3b8" }}>
                            ${trade.amount}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-mono font-semibold" style={{
                              color: trade.result === "won" ? "#00e6a0" : trade.result === "lost" ? "#ff4757" : "#ffc542",
                            }}>
                              {trade.result.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs" style={{ color: trade.pnl >= 0 ? "#00e6a0" : "#ff4757" }}>
                            {formatPnl(trade.pnl)}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "#475569" }}>
                            {new Date(trade.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "#1e2533" }}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTradePage(p => Math.max(0, p - 1))}
                      disabled={tradePage === 0}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono disabled:opacity-30"
                      style={{ backgroundColor: "#161b27", color: "#94a3b8", border: "1px solid #1e2533" }}
                    >
                      ← Prev
                    </button>
                    <span className="text-xs font-mono" style={{ color: "#475569" }}>
                      Page {tradePage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setTradePage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={tradePage >= totalPages - 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono disabled:opacity-30"
                      style={{ backgroundColor: "#161b27", color: "#94a3b8", border: "1px solid #1e2533" }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
