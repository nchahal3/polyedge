"use client";
import type { MockSignal } from "@/lib/mockData";

interface Props {
  signal: MockSignal;
}

export function ShareSignalButton({ signal }: Props) {
  function share() {
    const text = `${signal.walletCount}/${signal.totalWallets} sharp Polymarket wallets are betting ${signal.outcome} on "${signal.marketTitle}"\n\nSignal strength: ${Math.round(signal.strength * 100)}% (${signal.tier})\n\nvia PolyEdge — track the sharp money`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); share(); }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-opacity hover:opacity-80"
      style={{ backgroundColor: "rgba(29,161,242,0.1)", color: "#1DA1F2", border: "1px solid rgba(29,161,242,0.2)" }}
      title="Share this signal on X (Twitter)"
    >
      𝕏 Share
    </button>
  );
}
