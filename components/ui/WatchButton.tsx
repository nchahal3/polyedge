"use client";
import { useState, useEffect } from "react";
import { toggleWatchlist, isWatched } from "@/lib/watchlist";

interface WatchButtonProps {
  walletId: string;
  size?: "sm" | "md";
  onToggle?: (watched: boolean) => void;
}

export function WatchButton({ walletId, size = "sm", onToggle }: WatchButtonProps) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isWatched(walletId));
  }, [walletId]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const next = toggleWatchlist(walletId);
    setWatched(next);
    onToggle?.(next);
  }

  const isSm = size === "sm";

  return (
    <button
      onClick={handleClick}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
      className="flex items-center gap-1 rounded-lg font-mono font-semibold transition-all hover:opacity-80"
      style={{
        padding: isSm ? "2px 8px" : "6px 14px",
        fontSize: isSm ? "11px" : "13px",
        backgroundColor: watched ? "rgba(255,197,66,0.15)" : "rgba(255,255,255,0.05)",
        color: watched ? "#ffc542" : "#94a3b8",
        border: `1px solid ${watched ? "rgba(255,197,66,0.3)" : "#1e2533"}`,
      }}
    >
      {watched ? "★ Watching" : "☆ Watch"}
    </button>
  );
}
