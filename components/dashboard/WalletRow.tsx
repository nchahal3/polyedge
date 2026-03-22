"use client";
import { useState } from "react";
import Link from "next/link";
import { BotScoreBadge } from "@/components/ui/BotScoreBadge";
import { WatchButton } from "@/components/ui/WatchButton";
import {
  truncateAddress,
  formatPnl,
  timeAgo,
  getWinRateColor,
} from "@/lib/utils";
import type { MockWallet } from "@/lib/mockData";

interface WalletRowProps {
  wallet: MockWallet;
  rank: number;
  selected?: boolean;
  onSelect?: () => void;
  compareDisabled?: boolean;
}

export function WalletRow({ wallet, rank, selected, onSelect, compareDisabled }: WalletRowProps) {
  const [expanded, setExpanded] = useState(false);
  const winRateColor = getWinRateColor(wallet.winRate);

  return (
    <>
      <tr
        className="border-b cursor-pointer hover:bg-white/[0.02] transition-colors"
        style={{ borderColor: "#1e2533" }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Checkbox */}
        <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected ?? false}
            onChange={onSelect}
            disabled={compareDisabled}
            className="w-3.5 h-3.5 accent-emerald-400 cursor-pointer disabled:opacity-30"
            title="Select for comparison"
          />
        </td>

        {/* Rank */}
        <td className="px-4 py-3 font-mono text-sm" style={{ color: "#475569" }}>
          #{rank}
        </td>

        {/* Wallet */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${winRateColor}33, ${winRateColor}11)`,
                color: winRateColor,
              }}
            >
              {(wallet.alias ?? truncateAddress(wallet.address)).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                  {wallet.alias ?? truncateAddress(wallet.address)}
                </span>
                {wallet.verified && (
                  <span className="text-xs" style={{ color: "#00e6a0" }} title="Verified">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-xs font-mono" style={{ color: "#475569" }}>
                {truncateAddress(wallet.address)}
              </div>
            </div>
          </div>
        </td>

        {/* Win Rate */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-mono font-semibold" style={{ color: winRateColor }}>
              {wallet.winRate}%
            </div>
            <div
              className="w-16 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "#1e2533" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${wallet.winRate}%`, backgroundColor: winRateColor }}
              />
            </div>
          </div>
        </td>

        {/* Resolved Bets */}
        <td className="px-4 py-3 font-mono text-sm" style={{ color: "#94a3b8" }}>
          {wallet.resolvedBets}
        </td>

        {/* PnL */}
        <td
          className="px-4 py-3 font-mono text-sm font-semibold"
          style={{ color: wallet.pnl >= 0 ? "#00e6a0" : "#ff4757" }}
        >
          {formatPnl(wallet.pnl)}
        </td>

        {/* Bot Score */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <BotScoreBadge score={wallet.botScore} />
            <span className="text-xs font-mono" style={{ color: "#475569" }}>
              {wallet.botScore}
            </span>
          </div>
        </td>

        {/* Active Bets */}
        <td className="px-4 py-3 font-mono text-sm" style={{ color: "#4ecdc4" }}>
          {wallet.activeBets}
        </td>

        {/* Win Streak */}
        <td className="px-4 py-3">
          {wallet.winStreak > 0 && (
            <span className="font-mono text-sm" style={{ color: "#ffc542" }}>
              🔥 {wallet.winStreak}
            </span>
          )}
        </td>

        {/* Last Active */}
        <td className="px-4 py-3 text-xs font-mono" style={{ color: "#475569" }}>
          {timeAgo(wallet.lastActive)}
        </td>

        {/* Expand */}
        <td className="px-4 py-3 text-xs" style={{ color: "#475569" }}>
          {expanded ? "▲" : "▼"}
        </td>
      </tr>

      {/* Expanded row */}
      {expanded && (
        <tr>
          <td colSpan={11} className="px-4 pb-4" style={{ backgroundColor: "#080a0e" }}>
            <div
              className="mt-2 rounded-xl border p-4"
              style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                  Active Positions
                </h4>
                <div className="flex items-center gap-2">
                  <WatchButton walletId={wallet.id} />
                  <Link
                    href={`/dashboard/wallet/${wallet.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{
                      backgroundColor: "rgba(0,230,160,0.1)",
                      color: "#00e6a0",
                      border: "1px solid rgba(0,230,160,0.2)",
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    View Full Profile →
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {wallet.activeTrades.slice(0, 6).map((trade, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533" }}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <a
                        href={trade.polymarketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium truncate block hover:underline"
                        style={{ color: "#e2e8f0" }}
                        onClick={e => e.stopPropagation()}
                        title="Browse Polymarket (mock data — real URLs come from live API)"
                      >
                        {trade.marketTitle} ↗
                      </a>
                      <div className="text-xs font-mono mt-0.5" style={{ color: "#475569" }}>
                        {trade.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                        style={{
                          color: trade.outcome === "YES" ? "#00e6a0" : "#ff4757",
                          backgroundColor:
                            trade.outcome === "YES"
                              ? "rgba(0,230,160,0.1)"
                              : "rgba(255,71,87,0.1)",
                        }}
                      >
                        {trade.outcome}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>
                        {(trade.odds * 100).toFixed(0)}¢
                      </span>
                      <span className="text-xs font-mono font-semibold" style={{ color: "#4ecdc4" }}>
                        ${trade.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
