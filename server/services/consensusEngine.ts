import { getCached, setCached } from "@/lib/redis";
import { getTopWallets } from "./walletTracker";

export interface ConsensusSignal {
  id: string;
  marketId: string;
  marketTitle: string;
  polymarketUrl: string;
  outcome: string;
  outcomeIndex: number;
  strength: number;
  tier: "STRONG" | "MODERATE" | "WEAK";
  walletCount: number;
  totalWallets: number;
  totalVolume: number;
  avgOdds: number;
  category: string;
  wallets: string[];
  createdAt: string;
}

export async function calculateConsensusSignals(
  category: string,
  filters: {
    minWinRate: number;
    maxBotScore: number;
    topN: number;
  }
): Promise<ConsensusSignal[]> {
  const cacheKey = `consensus:${category}:${filters.minWinRate}:${filters.maxBotScore}:${filters.topN}`;
  const cached = await getCached<ConsensusSignal[]>(cacheKey);
  if (cached) return cached;

  const wallets = await getTopWallets(
    category,
    filters.minWinRate,
    filters.maxBotScore,
    filters.topN,
    "winRate"
  );

  if (wallets.length === 0) return [];

  // Group positions by conditionId + outcomeIndex
  const positionMap = new Map<
    string,
    {
      marketTitle: string;
      slug: string;
      outcome: string;
      outcomeIndex: number;
      category: string;
      wallets: string[];
      totalVolume: number;
      totalOdds: number;
    }
  >();

  for (const wallet of wallets) {
    for (const trade of wallet.activeTrades) {
      const key = `${trade.marketId}-${trade.outcome}`;
      const existing = positionMap.get(key);
      if (existing) {
        existing.wallets.push(wallet.address);
        existing.totalVolume += trade.size;
        existing.totalOdds += trade.odds;
      } else {
        positionMap.set(key, {
          marketTitle: trade.marketTitle,
          slug: trade.polymarketUrl.split("/event/")[1] ?? "",
          outcome: trade.outcome,
          outcomeIndex: 0,
          category: wallet.primaryCategory,
          wallets: [wallet.address],
          totalVolume: trade.size,
          totalOdds: trade.odds,
        });
      }
    }
  }

  const totalWallets = wallets.length;
  const signals: ConsensusSignal[] = [];

  for (const [key, data] of positionMap.entries()) {
    const strength = data.wallets.length / totalWallets;
    if (strength < 0.3) continue;

    let tier: "STRONG" | "MODERATE" | "WEAK";
    if (strength >= 0.7) tier = "STRONG";
    else if (strength >= 0.5) tier = "MODERATE";
    else tier = "WEAK";

    signals.push({
      id: key,
      marketId: key.split("-")[0],
      marketTitle: data.marketTitle,
      polymarketUrl: `https://polymarket.com/event/${data.slug}`,
      outcome: data.outcome,
      outcomeIndex: data.outcomeIndex,
      strength,
      tier,
      walletCount: data.wallets.length,
      totalWallets,
      totalVolume: data.totalVolume,
      avgOdds: data.wallets.length > 0 ? data.totalOdds / data.wallets.length : 0,
      category: data.category,
      wallets: data.wallets,
      createdAt: new Date().toISOString(),
    });
  }

  signals.sort((a, b) => b.strength - a.strength || b.totalVolume - a.totalVolume);

  await setCached(cacheKey, signals, 5 * 60);
  return signals;
}
