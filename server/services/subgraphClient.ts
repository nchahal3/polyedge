import { getCached, setCached } from "@/lib/redis";

const SUBGRAPH_URL = process.env.SUBGRAPH_URL ?? "";
const DATA_URL = process.env.POLYMARKET_DATA_URL ?? "https://data-api.polymarket.com";

async function querySubgraph<T = unknown>(query: string): Promise<T> {
  if (!SUBGRAPH_URL) throw new Error("SUBGRAPH_URL env var is not set");
  const res = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Subgraph HTTP error: ${res.status}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`Subgraph query error: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

export interface SubgraphAccount {
  id: string;
  numTrades: string;
  collateralVolume: string;
  lastSeenTimestamp: string;
}

export interface SubgraphTransaction {
  id: string;
  type: string;
  tradeAmount: string;
  outcomeIndex: string;
  outcomeTokensAmount: string;
  timestamp: string;
  condition: { id: string } | null;
}

// Fallback: discover active wallets from the Data API activity feed
async function getTopAccountsFromActivity(limit: number): Promise<SubgraphAccount[]> {
  const res = await fetch(
    `${DATA_URL}/activity?limit=500`,
    { headers: { Accept: "application/json" }, next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Activity fallback HTTP error: ${res.status}`);

  const activities = await res.json() as Array<{ proxyWallet?: string; timestamp?: string }>;
  if (!Array.isArray(activities)) throw new Error("Unexpected activity response shape");

  // Deduplicate by wallet address, keep most-recent timestamp
  const walletMap = new Map<string, string>();
  for (const a of activities) {
    const addr = a.proxyWallet?.toLowerCase();
    if (!addr) continue;
    if (!walletMap.has(addr)) walletMap.set(addr, a.timestamp ?? "0");
  }

  return Array.from(walletMap.entries())
    .slice(0, limit)
    .map(([id, lastSeenTimestamp]) => ({
      id,
      numTrades: "10",
      collateralVolume: "0",
      lastSeenTimestamp,
    }));
}

// Top accounts — tries subgraph first, falls back to Data API activity
export async function getTopAccounts(limit = 200): Promise<SubgraphAccount[]> {
  const cacheKey = `subgraph:top_accounts:${limit}`;
  const cached = await getCached<SubgraphAccount[]>(cacheKey);
  if (cached) return cached;

  let accounts: SubgraphAccount[];

  try {
    const query = `{
      accounts(
        orderBy: collateralVolume
        orderDirection: desc
        first: ${limit}
      ) {
        id
        numTrades
        collateralVolume
        lastSeenTimestamp
      }
    }`;
    const data = await querySubgraph<{ accounts: SubgraphAccount[] }>(query);
    accounts = data.accounts ?? [];
  } catch (subgraphErr) {
    console.warn("Subgraph unavailable, falling back to Data API activity:", subgraphErr);
    try {
      accounts = await getTopAccountsFromActivity(limit);
    } catch (fallbackErr) {
      console.error("Both subgraph and activity fallback failed:", fallbackErr);
      return [];
    }
  }

  await setCached(cacheKey, accounts, 15 * 60); // 15 min TTL
  return accounts;
}

// Trade history for a single wallet — used for bot detection timing analysis
export async function getAccountTransactions(
  address: string,
  limit = 500
): Promise<SubgraphTransaction[]> {
  const cacheKey = `subgraph:txns:${address.toLowerCase()}:${limit}`;
  const cached = await getCached<SubgraphTransaction[]>(cacheKey);
  if (cached) return cached;

  try {
    const query = `{
      transactions(
        where: { user: "${address.toLowerCase()}" }
        orderBy: timestamp
        orderDirection: desc
        first: ${limit}
      ) {
        id
        type
        tradeAmount
        outcomeIndex
        outcomeTokensAmount
        timestamp
        condition { id }
      }
    }`;

    const data = await querySubgraph<{ transactions: SubgraphTransaction[] }>(query);
    const txns = data.transactions ?? [];

    await setCached(cacheKey, txns, 10 * 60); // 10 min TTL
    return txns;
  } catch {
    return []; // Non-fatal — bot detection still works without this
  }
}
