"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MOCK_WALLETS } from "@/lib/mockData";
import { truncateAddress, getBotBadge, getWinRateColor } from "@/lib/utils";

export function WalletSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = query.length >= 2
    ? MOCK_WALLETS.filter(w =>
        (w.alias?.toLowerCase().includes(query.toLowerCase())) ||
        w.address.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectWallet(id: string) {
    setQuery("");
    setOpen(false);
    router.push(`/dashboard/wallet/${id}`);
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ backgroundColor: "#0f1117", border: "1px solid #1e2533" }}>
        <span style={{ color: "#475569", fontSize: "13px" }}>⌕</span>
        <input
          type="text"
          placeholder="Search wallet or address..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="bg-transparent outline-none text-sm font-mono w-48"
          style={{ color: "#e2e8f0" }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} style={{ color: "#475569", fontSize: "13px" }}>✕</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute top-full mt-1 left-0 w-72 rounded-xl overflow-hidden z-50 shadow-2xl"
          style={{ backgroundColor: "#0f1117", border: "1px solid #1e2533" }}
        >
          {results.map(wallet => {
            const winColor = getWinRateColor(wallet.winRate);
            const botBadge = getBotBadge(wallet.botScore);
            return (
              <button
                key={wallet.id}
                onClick={() => selectWallet(wallet.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors border-b"
                style={{ borderColor: "#1e2533" }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${winColor}33, ${winColor}11)`, color: winColor }}>
                  {(wallet.alias ?? truncateAddress(wallet.address)).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#e2e8f0" }}>
                    {wallet.alias ?? truncateAddress(wallet.address)}
                    {wallet.verified && <span className="ml-1 text-xs" style={{ color: "#00e6a0" }}>✓</span>}
                  </div>
                  <div className="text-xs font-mono" style={{ color: "#475569" }}>{truncateAddress(wallet.address)}</div>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-xs font-mono font-bold" style={{ color: winColor }}>{wallet.winRate}%</span>
                  <span className="text-xs font-mono" style={{ color: botBadge.color }}>{botBadge.label}</span>
                </div>
              </button>
            );
          })}
          {query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-3 text-sm" style={{ color: "#475569" }}>No wallets found for &ldquo;{query}&rdquo;</div>
          )}
        </div>
      )}
    </div>
  );
}
