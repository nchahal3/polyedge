"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MOCK_SIGNALS, RESOLVED_SIGNALS, CATEGORIES, getSignalAccuracy, type Category } from "@/lib/mockData";
import { formatVolume, timeAgo } from "@/lib/utils";
import { ShareSignalButton } from "@/components/ui/ShareSignalButton";
import { AlertSignupForm } from "@/components/ui/AlertSignupForm";

export default function SignalsPage() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"strength" | "volume" | "wallets">("strength");
  const [simDays, setSimDays] = useState(30);

  const signals = useMemo(() => {
    const filtered =
      category === "all"
        ? MOCK_SIGNALS
        : MOCK_SIGNALS.filter(s => s.category === category);
    return [...filtered].sort((a, b) => {
      if (sortBy === "strength") return b.strength - a.strength;
      if (sortBy === "volume") return b.totalVolume - a.totalVolume;
      return b.walletCount - a.walletCount;
    });
  }, [category, sortBy]);

  const strongCount = signals.filter(s => s.tier === "STRONG").length;
  const accuracy = getSignalAccuracy();

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: strongCount > 0 ? "#ff4757" : "#ffc542" }}
              />
              <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>
                Consensus Signals
              </h1>
              {strongCount > 0 && (
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: "rgba(255,71,87,0.15)", color: "#ff4757" }}
                >
                  {strongCount} STRONG
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: "#475569" }}>
              Signals form when top-performing wallets converge on the same market position.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Category filter */}
            <div className="flex items-center gap-1 overflow-x-auto flex-wrap">
              {(["all", ...CATEGORIES] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: category === cat ? "#00e6a0" : "rgba(255,255,255,0.04)",
                    color: category === cat ? "#000" : "#94a3b8",
                    border: category === cat ? "none" : "1px solid #1e2533",
                  }}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="ml-auto px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
              style={{
                backgroundColor: "#0f1117",
                border: "1px solid #1e2533",
                color: "#e2e8f0",
              }}
            >
              <option value="strength">Sort: Strength</option>
              <option value="volume">Sort: Volume</option>
              <option value="wallets">Sort: Wallets</option>
            </select>
          </div>

          {/* Accuracy banner */}
          <div className="rounded-xl border p-5" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Signal Track Record</h3>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Based on {accuracy.totalResolved} resolved signals in the last 90 days</p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: "rgba(0,230,160,0.1)", color: "#00e6a0", border: "1px solid rgba(0,230,160,0.2)" }}>
                VERIFIED HISTORY
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: "STRONG SIGNAL ACCURACY", value: `${accuracy.strongAccuracy}%`, color: "#00e6a0", sub: "signals called correctly" },
                { label: "OVERALL ACCURACY", value: `${accuracy.overallAccuracy}%`, color: "#4ecdc4", sub: "all tiers combined" },
                { label: "SIGNALS RESOLVED", value: accuracy.totalResolved.toString(), color: "#94a3b8", sub: "last 90 days" },
                { label: "AVG WIN RETURN", value: `+${accuracy.avgPnlOnWins}%`, color: "#ffc542", sub: "on winning signals" },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg p-3" style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}>
                  <div className="text-xs font-mono mb-1" style={{ color: "#475569" }}>{stat.label}</div>
                  <div className="text-xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent resolved signals */}
            <div>
              <div className="text-xs font-mono mb-2" style={{ color: "#475569" }}>RECENT RESOLVED SIGNALS</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {RESOLVED_SIGNALS.slice(0, 6).map(sig => (
                  <div key={sig.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}>
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: sig.result === "correct" ? "#00e6a0" : "#ff4757", backgroundColor: sig.result === "correct" ? "rgba(0,230,160,0.1)" : "rgba(255,71,87,0.1)" }}>
                      {sig.result === "correct" ? "✓ CORRECT" : "✗ WRONG"}
                    </span>
                    <span className="flex-1 text-xs truncate" style={{ color: "#e2e8f0" }}>{sig.marketTitle}</span>
                    <span className="text-xs font-mono shrink-0" style={{ color: sig.result === "correct" ? "#00e6a0" : "#ff4757" }}>
                      {sig.result === "correct" ? `+${sig.pnlIfFollowed}%` : `${sig.pnlIfFollowed}%`}
                    </span>
                    <span className="text-xs font-mono shrink-0" style={{ color: "#475569" }}>
                      {sig.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROI Simulator */}
          <div className="rounded-xl border p-5" style={{ borderColor: "rgba(0,230,160,0.2)", backgroundColor: "rgba(0,230,160,0.03)" }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: "#00e6a0" }}>📈</span>
                  <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Signal ROI Simulator</h3>
                </div>
                <p className="text-xs" style={{ color: "#475569" }}>
                  Hypothetical: if you bet $100 on every STRONG signal that resolved in the last {simDays} days
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono" style={{ color: "#475569" }}>LOOKBACK:</span>
                {[7, 30, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setSimDays(d)}
                    className="px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all"
                    style={{
                      backgroundColor: simDays === d ? "#00e6a0" : "rgba(255,255,255,0.05)",
                      color: simDays === d ? "#000" : "#94a3b8",
                      border: simDays === d ? "none" : "1px solid #1e2533",
                    }}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const cutoff = new Date(Date.now() - simDays * 86400000);
              const relevant = RESOLVED_SIGNALS.filter(s => s.tier === "STRONG" && s.resolvedAt >= cutoff);
              const wins = relevant.filter(s => s.result === "correct");
              const totalBet = relevant.length * 100;
              const totalReturn = wins.reduce((sum, s) => sum + 100 + s.pnlIfFollowed, 0) + (relevant.length - wins.length) * 0;
              const netPnl = totalReturn - totalBet;
              const roi = totalBet > 0 ? ((netPnl / totalBet) * 100).toFixed(1) : "0.0";
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: "SIGNALS FOLLOWED", value: relevant.length.toString(), color: "#94a3b8" },
                    { label: "TOTAL INVESTED", value: `$${totalBet}`, color: "#94a3b8" },
                    { label: "NET PnL", value: `${netPnl >= 0 ? "+" : ""}$${Math.round(netPnl)}`, color: netPnl >= 0 ? "#00e6a0" : "#ff4757" },
                    { label: "ROI", value: `${parseFloat(roi) >= 0 ? "+" : ""}${roi}%`, color: parseFloat(roi) >= 0 ? "#00e6a0" : "#ff4757" },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-lg p-3" style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}>
                      <div className="text-xs font-mono mb-1" style={{ color: "#475569" }}>{stat.label}</div>
                      <div className="text-xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            <p className="text-xs mt-3" style={{ color: "#475569" }}>
              * Hypothetical backtest only. Past performance does not guarantee future results. Not financial advice.
            </p>
          </div>

          {/* Alert signup */}
          <AlertSignupForm />

          {/* Signal cards */}
          {signals.length === 0 ? (
            <div
              className="rounded-xl border py-16 text-center"
              style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
            >
              <div className="text-3xl mb-2">📡</div>
              <div className="text-sm" style={{ color: "#94a3b8" }}>
                No signals for this category.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.map(signal => {
                const isStrong = signal.tier === "STRONG";
                const accentColor = isStrong ? "#ff4757" : "#ffc542";
                const strengthPct = Math.round(signal.strength * 100);

                return (
                  <div
                    key={signal.id}
                    className="rounded-xl border p-5"
                    style={{
                      borderColor: isStrong ? "rgba(255,71,87,0.3)" : "#1e2533",
                      backgroundColor: isStrong ? "rgba(255,71,87,0.04)" : "#0f1117",
                      boxShadow: isStrong ? "0 0 20px rgba(255,71,87,0.08)" : undefined,
                    }}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0"
                            style={{
                              color: signal.outcome === "YES" ? "#00e6a0" : "#ff4757",
                              backgroundColor:
                                signal.outcome === "YES"
                                  ? "rgba(0,230,160,0.1)"
                                  : "rgba(255,71,87,0.1)",
                            }}
                          >
                            {signal.outcome}
                          </span>
                          <span
                            className="text-base font-semibold hover:underline"
                            style={{ color: "#e2e8f0" }}
                          >
                            <a
                              href={signal.polymarketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Browse Polymarket (mock data — real URLs come from live API)"
                            >
                              {signal.marketTitle} ↗
                            </a>
                          </span>
                        </div>
                        <div
                          className="flex flex-wrap items-center gap-3 text-xs font-mono"
                          style={{ color: "#94a3b8" }}
                        >
                          <span
                            style={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {signal.category}
                          </span>
                          <span>Signal formed {timeAgo(signal.formedAt)}</span>
                        </div>
                      </div>
                      <span
                        className="text-sm font-mono font-bold px-3 py-1 rounded-lg shrink-0"
                        style={{
                          color: accentColor,
                          backgroundColor: `${accentColor}18`,
                          border: `1px solid ${accentColor}33`,
                        }}
                      >
                        {signal.tier}
                      </span>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {[
                        {
                          label: "SIGNAL STRENGTH",
                          value: `${strengthPct}%`,
                          color: accentColor,
                        },
                        {
                          label: "WALLETS",
                          value: `${signal.walletCount} / ${signal.totalWallets}`,
                          color: accentColor,
                        },
                        {
                          label: "CURRENT ODDS",
                          value: `${(signal.currentOdds * 100).toFixed(0)}¢`,
                          color: "#94a3b8",
                        },
                        {
                          label: "TOTAL VOLUME",
                          value: formatVolume(signal.totalVolume),
                          color: "#4ecdc4",
                        },
                      ].map(stat => (
                        <div
                          key={stat.label}
                          className="rounded-lg p-3"
                          style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}
                        >
                          <div
                            className="text-xs font-mono mb-1"
                            style={{ color: "#475569" }}
                          >
                            {stat.label}
                          </div>
                          <div
                            className="text-lg font-mono font-bold"
                            style={{ color: stat.color }}
                          >
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Strength bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono" style={{ color: "#475569" }}>
                          SIGNAL STRENGTH
                        </span>
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: accentColor }}
                        >
                          {strengthPct}%
                        </span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: "#1e2533" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${strengthPct}%`, backgroundColor: accentColor }}
                        />
                      </div>
                    </div>

                    {/* Wallets */}
                    <div>
                      <div
                        className="text-xs font-mono mb-2"
                        style={{ color: "#475569" }}
                      >
                        WALLETS IN SIGNAL
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {signal.walletAliases.map(alias => (
                          <span
                            key={alias}
                            className="text-xs px-2 py-0.5 rounded font-mono"
                            style={{
                              backgroundColor: "#161b27",
                              color: "#94a3b8",
                              border: "1px solid #1e2533",
                            }}
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Place bet CTA */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: isStrong ? "rgba(255,71,87,0.12)" : "#1e2533" }}>
                      <span className="text-xs font-mono" style={{ color: "#475569" }}>
                        {signal.walletCount}/{signal.totalWallets} sharp wallets agree · formed {timeAgo(signal.formedAt)}
                      </span>
                      <a
                        href={signal.polymarketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-mono font-bold transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: signal.outcome === "YES" ? "#00e6a0" : "#ff4757",
                          color: "#000",
                        }}
                      >
                        Bet {signal.outcome} on Polymarket ↗
                      </a>
                    </div>

                    {/* Share button */}
                    <div className="flex items-center justify-end mt-2">
                      <ShareSignalButton signal={signal} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
