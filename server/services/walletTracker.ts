import { getCached, setCached } from "@/lib/redis";
import * as polymarketClient from "./polymarketClient";
import * as subgraphClient from "./subgraphClient";
import { calculateBotScore, type BotScore } from "./botDetector";

export interface WalletStats {
  id: string;
  address: string;
  alias: string | null;
  winRate: number;
  totalBets: number;
  resolvedBets: number;
  pnl: number;
  totalVolume: number;
  activeBets: number;
  winStreak: number;
  lastActive: string;
  botScore: number;
  botBreakdown: BotScore;
  categories: string[];
  primaryCategory: string;
  activeTrades: ActiveTrade[];
  snapshots: { date: string; winRate: number; pnl: number }[];
  categoryBreakdown: { category: string; pct: number; bets: number }[];
  tradeHistory: TradeHistoryItem[];
}

export interface ActiveTrade {
  marketId: string;
  marketTitle: string;
  polymarketUrl: string;
  outcome: string;
  odds: number;
  size: number;
  pnl: number;
}

export interface TradeHistoryItem {
  id: string;
  marketTitle: string;
  outcome: string;
  amount: number;
  result: "won" | "lost" | "open";
  pnl: number;
  date: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processWallet(address: string): Promise<WalletStats | null> {
  const cacheKey = `wallet:stats:${address.toLowerCase()}`;
  const cached = await getCached<WalletStats>(cacheKey);
  if (cached) return cached;

  try {
    const [positions, activity, transactions, profile] = await Promise.allSettled([
      polymarketClient.getWalletPositions(address),
      polymarketClient.getWalletActivity(address, 500),
      subgraphClient.getAccountTransactions(address, 500),
      polymarketClient.getProfile(address),
    ]);

    const positionData = positions.status === "fulfilled" ? positions.value : [];
    const activityData = activity.status === "fulfilled" ? activity.value : [];
    const txnData = transactions.status === "fulfilled" ? transactions.value : [];
    const profileData = profile.status === "fulfilled" ? profile.value : null;

    // Win rate from positions
    const resolvedPositions = positionData.filter((p) => p.closed);
    const wonPositions = resolvedPositions.filter((p) => p.redeemable);
    const resolvedBets = resolvedPositions.length;
    const winRate = resolvedBets >= 5 ? wonPositions.length / resolvedBets : 0;

    // PnL from all positions
    const pnl = positionData.reduce((sum, p) => sum + (p.cashPnl ?? 0), 0);

    // Active (open) positions
    const openPositions = positionData.filter((p) => !p.closed);
    const activeTrades: ActiveTrade[] = openPositions.slice(0, 10).map((p) => ({
      marketId: p.conditionId,
      marketTitle: p.title,
      polymarketUrl: `https://polymarket.com/event/${p.slug}`,
      outcome: p.outcome,
      odds: p.curPrice,
      size: p.size,
      pnl: p.cashPnl,
    }));

    // Category breakdown from activity
    const categoryMap = new Map<string, number>();
    for (const a of activityData) {
      // Use title keywords to guess category
      const cat = guessCategory(a.title ?? "");
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
    }
    const totalCatBets = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0) || 1;
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, bets]) => ({ category, bets, pct: bets / totalCatBets }))
      .sort((a, b) => b.bets - a.bets);

    const primaryCategory = categoryBreakdown[0]?.category ?? "Other";
    const categories = categoryBreakdown.slice(0, 3).map((c) => c.category);

    // Bot score
    const botBreakdown = calculateBotScore(activityData, txnData, winRate, activityData.length);

    // Trade history (last 20 from activity)
    const tradeHistory: TradeHistoryItem[] = activityData.slice(0, 20).map((a) => ({
      id: a.id,
      marketTitle: a.title ?? "Unknown",
      outcome: a.outcome ?? "Unknown",
      amount: a.amount,
      result: "open" as const,
      pnl: 0,
      date: a.timestamp,
    }));

    // Last active
    const lastActive =
      activityData[0]?.timestamp ??
      txnData[0]?.timestamp
        ? new Date(parseInt(txnData[0]?.timestamp ?? "0") * 1000).toISOString()
        : new Date().toISOString();

    // Volume from subgraph account (collateralVolume is in wei-like units / 1e6 for USDC)
    const totalVolume = pnl !== 0 ? Math.abs(pnl) * 10 : activityData.reduce((s, a) => s + a.amount, 0);

    const stats: WalletStats = {
      id: address.toLowerCase(),
      address: address.toLowerCase(),
      alias: profileData?.name ?? profileData?.username ?? null,
      winRate,
      totalBets: activityData.length,
      resolvedBets,
      pnl,
      totalVolume,
      activeBets: openPositions.length,
      winStreak: 0, // simplified
      lastActive,
      botScore: botBreakdown.total,
      botBreakdown,
      categories,
      primaryCategory,
      activeTrades,
      snapshots: [],
      categoryBreakdown,
      tradeHistory,
    };

    await setCached(cacheKey, stats, 15 * 60);
    return stats;
  } catch (err) {
    console.error(`Failed to process wallet ${address}:`, err);
    return null;
  }
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/bitcoin|btc|eth|crypto|solana|xrp|defi|nft/.test(t)) return "Crypto";
  if (/nba|nfl|nhl|mlb|soccer|football|basketball|tennis|sports|match|game/.test(t)) return "Sports";
  if (/trump|biden|election|president|congress|senate|democrat|republican|politics/.test(t)) return "Politics";
  if (/fed|rate|gdp|inflation|stock|market|economy|recession/.test(t)) return "Finance";
  if (/war|iran|russia|china|ukraine|geopolit/.test(t)) return "Geopolitics";
  if (/oscar|grammy|celebrity|award|movie|music/.test(t)) return "Culture";
  if (/weather|hurricane|earthquake|temperature/.test(t)) return "Weather";
  return "Other";
}

export async function getTopWallets(
  category: string,
  minWinRate: number,
  maxBotScore: number,
  limit: number,
  sortBy: "winRate" | "pnl" | "volume"
): Promise<WalletStats[]> {
  const cacheKey = `wallets:top:${category}:${minWinRate}:${maxBotScore}:${limit}:${sortBy}`;
  const cached = await getCached<WalletStats[]>(cacheKey);
  if (cached) return cached;

  // Get top accounts from subgraph as seed
  const accounts = await subgraphClient.getTopAccounts(100);

  // Process in batches of 10 with delay
  const results: WalletStats[] = [];
  const batchSize = 10;

  for (let i = 0; i < Math.min(accounts.length, 50); i += batchSize) {
    const batch = accounts.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((acc) => processWallet(acc.id))
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value) results.push(r.value);
    }
    if (i + batchSize < accounts.length) await delay(200);
  }

  // Filter
  let filtered = results.filter(
    (w) =>
      w.botScore <= maxBotScore &&
      w.winRate * 100 >= minWinRate &&
      w.resolvedBets >= 5 &&
      (category === "all" || category === "All" || w.primaryCategory === category || w.categories.includes(category))
  );

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === "winRate") return b.winRate - a.winRate;
    if (sortBy === "pnl") return b.pnl - a.pnl;
    return b.totalVolume - a.totalVolume;
  });

  const top = filtered.slice(0, limit);
  await setCached(cacheKey, top, 15 * 60);
  return top;
}
