import { getCached, setCached } from "@/lib/redis";

const GAMMA_URL = process.env.GAMMA_API_URL ?? "https://gamma-api.polymarket.com";
const DATA_URL = process.env.POLYMARKET_DATA_URL ?? "https://data-api.polymarket.com";
const CLOB_URL = process.env.POLYMARKET_API_URL ?? "https://clob.polymarket.com";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json() as Promise<T>;
}

// ── Gamma API ──────────────────────────────────────────────────────────────

export interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  active: boolean;
  closed: boolean;
  markets: GammaMarket[];
  volume: string;
  liquidity: string;
  startDate: string;
  endDate: string;
}

export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  active: boolean;
  closed: boolean;
  outcomePrices: string; // JSON string: ["0.65","0.35"]
  outcomes: string;      // JSON string: ["Yes","No"]
  volume: string;
  liquidity: string;
  endDate: string;
}

export async function getActiveEvents(tag?: string, limit = 50): Promise<GammaEvent[]> {
  const cacheKey = `gamma:events:${tag ?? "all"}:${limit}`;
  const cached = await getCached<GammaEvent[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ active: "true", limit: String(limit) });
  if (tag && tag !== "all" && tag !== "All") params.append("tag", tag);

  const data = await fetchJSON<GammaEvent[]>(`${GAMMA_URL}/events?${params}`);
  await setCached(cacheKey, data, 5 * 60); // 5 min TTL
  return data;
}

export async function getActiveMarkets(limit = 100): Promise<GammaMarket[]> {
  const cacheKey = `gamma:markets:${limit}`;
  const cached = await getCached<GammaMarket[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<GammaMarket[]>(`${GAMMA_URL}/markets?active=true&limit=${limit}`);
  await setCached(cacheKey, data, 5 * 60);
  return data;
}

// ── Data API ───────────────────────────────────────────────────────────────

export interface PolyPosition {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  marketSlug: string;
  title: string;
  outcome: string;
  outcomeIndex: number;
  size: number;
  avgPrice: number;
  curPrice: number;
  initialValue: number;
  currentValue: number;
  cashPnl: number;
  percentPnl: number;
  redeemable: boolean;
  closed: boolean;
  endDate: string;
  slug: string;
  eventSlug: string;
}

export interface PolyActivity {
  id: string;
  proxyWallet: string;
  type: string;
  conditionId: string;
  marketSlug: string;
  title: string;
  outcome: string;
  outcomeIndex: number;
  amount: number;
  price: number;
  size: number;
  timestamp: string;
  transactionHash: string;
}

export interface PolyProfile {
  proxyWallet: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  profileImage: string | null;
}

export async function getWalletPositions(address: string): Promise<PolyPosition[]> {
  const cacheKey = `data:positions:${address.toLowerCase()}`;
  const cached = await getCached<PolyPosition[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    user: address.toLowerCase(),
    sizeThreshold: "0.1",
    sortBy: "CURRENT",
    sortDirection: "DESC",
  });

  const data = await fetchJSON<PolyPosition[]>(`${DATA_URL}/positions?${params}`);
  const positions = Array.isArray(data) ? data : [];
  await setCached(cacheKey, positions, 5 * 60);
  return positions;
}

export async function getWalletActivity(address: string, limit = 500): Promise<PolyActivity[]> {
  const cacheKey = `data:activity:${address.toLowerCase()}:${limit}`;
  const cached = await getCached<PolyActivity[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    user: address.toLowerCase(),
    type: "TRADE",
    limit: String(limit),
  });

  const data = await fetchJSON<PolyActivity[]>(`${DATA_URL}/activity?${params}`);
  const activity = Array.isArray(data) ? data : [];
  await setCached(cacheKey, activity, 5 * 60);
  return activity;
}

export async function getProfile(address: string): Promise<PolyProfile | null> {
  const cacheKey = `data:profile:${address.toLowerCase()}`;
  const cached = await getCached<PolyProfile>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<PolyProfile[]>(
    `${DATA_URL}/profiles?user=${address.toLowerCase()}`
  );
  const profile = Array.isArray(data) ? (data[0] ?? null) : null;
  if (profile) await setCached(cacheKey, profile, 60 * 60); // 1hr TTL
  return profile;
}

// ── CLOB API ───────────────────────────────────────────────────────────────

export async function getTokenPrice(tokenId: string): Promise<number | null> {
  const cacheKey = `clob:price:${tokenId}`;
  const cached = await getCached<number>(cacheKey);
  if (cached !== null) return cached;

  const data = await fetchJSON<{ price: string }>(`${CLOB_URL}/prices?token_id=${tokenId}`);
  const price = parseFloat(data.price);
  if (!isNaN(price)) await setCached(cacheKey, price, 60); // 1 min TTL
  return isNaN(price) ? null : price;
}
