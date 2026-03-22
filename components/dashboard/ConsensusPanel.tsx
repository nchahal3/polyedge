"use client";
import { useState } from "react";
import { formatVolume, timeAgo } from "@/lib/utils";
import type { MockSignal } from "@/lib/mockData";
import { ShareSignalButton } from "@/components/ui/ShareSignalButton";

interface ConsensusPanelProps {
  signals: MockSignal[];
}

export function ConsensusPanel({ signals }: ConsensusPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const strongSignals = signals.filter(s => s.tier === "STRONG");
  const otherSignals = signals.filter(s => s.tier !== "STRONG");

  if (signals.length === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
      >
        <div className="text-3xl mb-2">📡</div>
        <div className="text-sm" style={{ color: "#94a3b8" }}>
          No consensus signals for this category.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Strong signals — urgent treatment */}
      {strongSignals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#ff4757" }}
            />
            <span
              className="text-xs font-mono font-bold tracking-wider"
              style={{ color: "#ff4757" }}
            >
              HIGH CONVICTION — STRONG SIGNALS
            </span>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ backgroundColor: "rgba(255,71,87,0.15)", color: "#ff4757" }}
            >
              {strongSignals.length}
            </span>
          </div>
          <div className="space-y-2">
            {strongSignals.map(signal => (
              <SignalCard
                key={signal.id}
                signal={signal}
                expanded={expanded === signal.id}
                onToggle={() => setExpanded(e => (e === signal.id ? null : signal.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Moderate signals */}
      {otherSignals.length > 0 && (
        <div>
          {strongSignals.length > 0 && (
            <div className="flex items-center gap-2 mt-4 mb-2">
              <span
                className="text-xs font-mono font-bold tracking-wider"
                style={{ color: "#ffc542" }}
              >
                MODERATE SIGNALS
              </span>
            </div>
          )}
          <div className="space-y-2">
            {otherSignals.map(signal => (
              <SignalCard
                key={signal.id}
                signal={signal}
                expanded={expanded === signal.id}
                onToggle={() => setExpanded(e => (e === signal.id ? null : signal.id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCard({
  signal,
  expanded,
  onToggle,
}: {
  signal: MockSignal;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isStrong = signal.tier === "STRONG";
  const accentColor = isStrong ? "#ff4757" : "#ffc542";
  const strengthPct = Math.round(signal.strength * 100);

  return (
    <div
      className="rounded-xl border overflow-hidden cursor-pointer transition-all"
      style={{
        borderColor: isStrong ? "rgba(255,71,87,0.3)" : "#1e2533",
        backgroundColor: isStrong ? "rgba(255,71,87,0.04)" : "#0f1117",
        boxShadow: isStrong ? "0 0 20px rgba(255,71,87,0.08)" : undefined,
      }}
      onClick={onToggle}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Market title + outcome */}
            <div className="flex items-center gap-2 mb-1">
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
              <a
                href={signal.polymarketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium truncate hover:underline"
                style={{ color: "#e2e8f0" }}
                onClick={e => e.stopPropagation()}
                title="Browse Polymarket (mock data — real URLs come from live API)"
              >
                {signal.marketTitle} ↗
              </a>
            </div>

            {/* Wallet count + odds */}
            <div
              className="flex items-center gap-3 text-xs font-mono flex-wrap"
              style={{ color: "#94a3b8" }}
            >
              <span style={{ color: accentColor, fontWeight: 600 }}>
                {signal.walletCount} of {signal.totalWallets} wallets
              </span>
              <span>·</span>
              <span>{(signal.currentOdds * 100).toFixed(0)}¢</span>
              <span>·</span>
              <span>{formatVolume(signal.totalVolume)}</span>
              <span>·</span>
              <span style={{ color: "#475569" }}>{timeAgo(signal.formedAt)}</span>
            </div>
          </div>

          {/* Strength indicator */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded"
              style={{
                color: accentColor,
                backgroundColor: `${accentColor}18`,
                border: `1px solid ${accentColor}33`,
              }}
            >
              {signal.tier}
            </span>
            <div className="flex items-center gap-1">
              <div
                className="w-16 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "#1e2533" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${strengthPct}%`, backgroundColor: accentColor }}
                />
              </div>
              <span className="text-xs font-mono" style={{ color: accentColor }}>
                {strengthPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Place bet CTA */}
        <div className="mt-2 pt-2 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: isStrong ? "rgba(255,71,87,0.12)" : "#1e2533" }}>
          <span className="text-xs font-mono" style={{ color: "#475569" }}>
            Sharp consensus: {Math.round(signal.strength * 100)}% of top wallets
          </span>
          <a
            href={signal.polymarketUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: signal.outcome === "YES" ? "rgba(0,230,160,0.15)" : "rgba(255,71,87,0.15)",
              color: signal.outcome === "YES" ? "#00e6a0" : "#ff4757",
              border: `1px solid ${signal.outcome === "YES" ? "rgba(0,230,160,0.3)" : "rgba(255,71,87,0.3)"}`,
            }}
          >
            Bet {signal.outcome} on Polymarket ↗
          </a>
        </div>
      </div>

      {/* Expanded wallets list */}
      {expanded && (
        <div
          className="px-4 pb-3 border-t"
          style={{ borderColor: isStrong ? "rgba(255,71,87,0.15)" : "#1e2533" }}
        >
          <div className="text-xs font-mono mb-2 pt-2" style={{ color: "#475569" }}>
            WALLETS IN SIGNAL
          </div>
          <div className="flex flex-wrap gap-1.5">
            {signal.walletAliases.map(alias => (
              <span
                key={alias}
                className="text-xs px-2 py-0.5 rounded font-mono"
                style={{ backgroundColor: "#161b27", color: "#94a3b8", border: "1px solid #1e2533" }}
              >
                {alias}
              </span>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <ShareSignalButton signal={signal} />
          </div>
        </div>
      )}
    </div>
  );
}
