import { getCached, setCached } from "@/lib/redis";

const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;

async function querySubgraph<T = unknown>(query: string): Promise<T> {
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

// Top accounts by volume — seed list for leaderboard
export async function getTopAccounts(limit = 200): Promise<SubgraphAccount[]> {
  const cacheKey = `subgraph:top_accounts:${limit}`;
  const cached = await getCached<SubgraphAccount[]>(cacheKey);
  if (cached) return cached;

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
  const accounts = data.accounts ?? [];

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
}
