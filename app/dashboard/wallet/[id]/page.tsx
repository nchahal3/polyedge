"use client";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BotScoreBadge } from "@/components/ui/BotScoreBadge";
import { WatchButton } from "@/components/ui/WatchButton";
import { MOCK_WALLETS } from "@/lib/mockData";
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
  const wallet = MOCK_WALLETS.find(w => w.id === id);
  if (!wallet) notFound();

  const [tradePage, setTradePage] = useState(0);

  const winRateColor = getWinRateColor(wallet.winRate);
  const botBadge = getBotBadge(wallet.botScore);

  const chartData = wallet.snapshots
    .filter((_, i) => i % 3 === 0)
    .map(s => ({
      date: s.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      winRate: parseFloat(s.winRate.toFixed(1)),
      pnl: Math.round(s.pnl),
    }));

  const pagedTrades = wallet.tradeHistory.slice(tradePage * TRADES_PER_PAGE, (tradePage + 1) * TRADES_PER_PAGE);
  const totalPages = Math.ceil(wallet.tradeHistory.length / TRADES_PER_PAGE);

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
              {wallet.alias ?? truncateAddress(wallet.address)}
            </span>
          </div>

          {/* Profile header */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
          >
            <div className="flex flex-wrap items-start gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${winRateColor}33, ${winRateColor}11)`,
                  color: winRateColor,
                }}
              >
                {(wallet.alias ?? truncateAddress(wallet.address)).charAt(0).toUpperCase()}
              </div>

              {/* Name + address */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>
                    {wallet.alias ?? truncateAddress(wallet.address)}
                  </h1>
                  {wallet.verified && (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{
                        backgroundColor: "rgba(0,230,160,0.1)",
                        color: "#00e6a0",
                        border: "1px solid rgba(0,230,160,0.2)",
                      }}
                    >
                      ✓ VERIFIED
                    </span>
                  )}
                  <BotScoreBadge score={wallet.botScore} />
                  <WatchButton walletId={wallet.id} size="md" />
                </div>
                <div className="text-sm font-mono truncate" style={{ color: "#475569" }}>
                  {wallet.address}
                </div>
                <div className="text-xs mt-1" style={{ color: "#475569" }}>
                  Last active {timeAgo(wallet.lastActive)}
                </div>
              </div>

              {/* Key stats */}
              <div className="flex flex-wrap gap-6">
                {[
                  { label: "WIN RATE", value: `${wallet.winRate}%`, color: winRateColor },
                  {
                    label: "TOTAL PnL",
                    value: formatPnl(wallet.pnl),
                    color: wallet.pnl >= 0 ? "#00e6a0" : "#ff4757",
                  },
                  { label: "RESOLVED BETS", value: wallet.resolvedBets.toString(), color: "#4ecdc4" },
                  { label: "VOLUME", value: formatVolume(wallet.totalVolume), color: "#94a3b8" },
                ].map(stat => (
                  <div key={stat.label} className="text-right">
                    <div className="text-xs font-mono" style={{ color: "#475569" }}>
                      {stat.label}
                    </div>
                    <div className="text-lg font-mono font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Win rate chart */}
            <div
              className="md:col-span-2 rounded-xl border p-5"
              style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-sm font-mono font-semibold uppercase tracking-wider"
                  style={{ color: "#94a3b8" }}
                >
                  Win Rate Over Time
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#1e2533" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#475569", fontFamily: "JetBrains Mono" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#475569", fontFamily: "JetBrains Mono" }}
                    tickLine={false}
                    domain={[40, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1117",
                      border: "1px solid #1e2533",
                      borderRadius: "8px",
                      fontFamily: "JetBrains Mono",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#00e6a0" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#00e6a0"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
            >
              <h3
                className="text-sm font-mono font-semibold uppercase tracking-wider mb-4"
                style={{ color: "#94a3b8" }}
              >
                Category Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={wallet.categoryBreakdown}
                    dataKey="bets"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={35}
                  >
                    {wallet.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1117",
                      border: "1px solid #1e2533",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(
                      _val: unknown,
                      _name: unknown,
                      props: { payload?: { pct: number; category: string } }
                    ) => [props.payload?.pct + "%", props.payload?.category]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {wallet.categoryBreakdown.map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }}
                      />
                      <span style={{ color: "#94a3b8" }}>{c.category}</span>
                    </div>
                    <span className="font-mono" style={{ color: "#475569" }}>
                      {c.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bot detection breakdown */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h3
                className="text-sm font-mono font-semibold uppercase tracking-wider"
                style={{ color: "#94a3b8" }}
              >
                Bot Detection Analysis
              </h3>
              <BotScoreBadge score={wallet.botScore} />
              <span className="text-sm font-mono font-bold" style={{ color: botBadge.color }}>
                Overall: {wallet.botScore}/100
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {BOT_HEURISTICS.map(h => {
                const score = wallet.botBreakdown[h.key];
                const { color } = getBotBadge(score);
                return (
                  <div
                    key={h.key}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                        {h.label}
                      </span>
                      <span className="text-xs font-mono font-bold" style={{ color }}>
                        {score}/100
                      </span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden mb-2"
                      style={{ backgroundColor: "#1e2533" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${score}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: "#475569" }}>
                      {h.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade history */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
          >
            <div className="px-5 py-4 border-b" style={{ borderColor: "#1e2533" }}>
              <h3
                className="text-sm font-mono font-semibold uppercase tracking-wider"
                style={{ color: "#94a3b8" }}
              >
                Trade History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: "#1e2533" }}>
                    {["Market", "Outcome", "Amount", "Result", "PnL", "Date"].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-mono uppercase tracking-wider"
                        style={{ color: "#475569" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedTrades.map(trade => (
                    <tr
                      key={trade.id}
                      className="border-b hover:bg-white/[0.02]"
                      style={{ borderColor: "#1e2533" }}
                    >
                      <td
                        className="px-4 py-2.5 text-xs"
                        style={{ color: "#e2e8f0", maxWidth: "260px" }}
                      >
                        <a
                          href={trade.polymarketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate hover:underline"
                          style={{ color: "#e2e8f0" }}
                          title="Browse Polymarket (mock data — real URLs come from live API)"
                        >
                          {trade.marketTitle} ↗
                        </a>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs font-mono font-bold"
                          style={{
                            color: trade.outcome === "YES" ? "#00e6a0" : "#ff4757",
                          }}
                        >
                          {trade.outcome}
                        </span>
                      </td>
                      <td
                        className="px-4 py-2.5 font-mono text-xs"
                        style={{ color: "#94a3b8" }}
                      >
                        ${trade.amount}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs font-mono font-semibold"
                          style={{
                            color:
                              trade.result === "won"
                                ? "#00e6a0"
                                : trade.result === "lost"
                                ? "#ff4757"
                                : "#ffc542",
                          }}
                        >
                          {trade.result.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="px-4 py-2.5 font-mono text-xs"
                        style={{
                          color:
                            trade.pnl != null
                              ? trade.pnl >= 0
                                ? "#00e6a0"
                                : "#ff4757"
                              : "#475569",
                        }}
                      >
                        {trade.pnl != null ? formatPnl(trade.pnl) : "—"}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono"
                        style={{ color: "#475569" }}
                      >
                        {trade.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination + Export */}
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
              <button
                onClick={() => {
                  const rows = [
                    ["Market", "Outcome", "Amount", "Result", "PnL", "Date"],
                    ...wallet.tradeHistory.map(t => [
                      t.marketTitle,
                      t.outcome,
                      `$${t.amount}`,
                      t.result,
                      t.pnl != null ? (t.pnl >= 0 ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`) : "—",
                      t.date.toLocaleDateString(),
                    ]),
                  ];
                  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${wallet.alias ?? wallet.id}-trades.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium"
                style={{ backgroundColor: "rgba(0,230,160,0.1)", color: "#00e6a0", border: "1px solid rgba(0,230,160,0.2)" }}
              >
                ↓ Export CSV
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
