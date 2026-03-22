import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatPnl(pnl: number): string {
  const abs = Math.abs(pnl);
  const formatted = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(0)}`;
  return pnl >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(1)}k`;
  return `$${volume.toFixed(0)}`;
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getBotBadge(score: number): { label: string; color: string; bg: string } {
  if (score <= 15) return { label: "CLEAN", color: "#00e6a0", bg: "rgba(0,230,160,0.1)" };
  if (score <= 30) return { label: "LOW RISK", color: "#ffc542", bg: "rgba(255,197,66,0.1)" };
  if (score <= 60) return { label: "MODERATE", color: "#ff6b35", bg: "rgba(255,107,53,0.1)" };
  return { label: "SUSPECT", color: "#ff4757", bg: "rgba(255,71,87,0.1)" };
}

export function getSignalTier(strength: number): { tier: string; color: string; bg: string; urgent: boolean } {
  if (strength >= 0.7) return { tier: "STRONG", color: "#ff4757", bg: "rgba(255,71,87,0.15)", urgent: true };
  if (strength >= 0.5) return { tier: "MODERATE", color: "#ffc542", bg: "rgba(255,197,66,0.1)", urgent: false };
  return { tier: "WEAK", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", urgent: false };
}

export function getWinRateColor(rate: number): string {
  if (rate >= 85) return "#00e6a0";
  if (rate >= 75) return "#4ecdc4";
  if (rate >= 65) return "#ffc542";
  return "#ff6b35";
}
