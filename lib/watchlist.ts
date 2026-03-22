const KEY = "polyedge_watchlist";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(walletId: string): void {
  const list = getWatchlist();
  if (!list.includes(walletId)) {
    localStorage.setItem(KEY, JSON.stringify([...list, walletId]));
  }
}

export function removeFromWatchlist(walletId: string): void {
  const list = getWatchlist().filter(id => id !== walletId);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function toggleWatchlist(walletId: string): boolean {
  const list = getWatchlist();
  if (list.includes(walletId)) {
    removeFromWatchlist(walletId);
    return false;
  } else {
    addToWatchlist(walletId);
    return true;
  }
}

export function isWatched(walletId: string): boolean {
  return getWatchlist().includes(walletId);
}
