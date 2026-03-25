import type { PolyActivity } from "./polymarketClient";
import type { SubgraphTransaction } from "./subgraphClient";

export interface BotScore {
  total: number;
  timing: number;
  sizing: number;
  speed: number;
  diversity: number;
  volumeParadox: number;
}

function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 1; // assume human if too few data points
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 1;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function timingScore(transactions: SubgraphTransaction[]): number {
  if (transactions.length < 10) return 0;
  const timestamps = transactions
    .map((t) => parseInt(t.timestamp))
    .filter((t) => !isNaN(t))
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  const cv = coefficientOfVariation(intervals);
  // Low CV = regular intervals = bot
  if (cv < 0.1) return 95;
  if (cv < 0.2) return 80;
  if (cv < 0.3) return 60;
  if (cv < 0.5) return 35;
  return 10;
}

function sizingScore(activity: PolyActivity[]): number {
  if (activity.length < 5) return 0;
  const amounts = activity.map((a) => Math.round(a.amount * 100) / 100);
  if (amounts.length === 0) return 0;

  // Find most common amount (within 1% tolerance)
  let maxCount = 0;
  for (const amt of amounts) {
    const count = amounts.filter((a) => Math.abs(a - amt) / (amt || 1) <= 0.01).length;
    if (count > maxCount) maxCount = count;
  }

  const pct = maxCount / amounts.length;
  if (pct > 0.8) return 90;
  if (pct > 0.6) return 60;
  if (pct > 0.4) return 30;
  return 10;
}

function speedScore(activity: PolyActivity[]): number {
  // We don't have market creation time easily, so proxy:
  // If many trades happen at the same second or within the same minute, flag it
  if (activity.length < 5) return 0;

  const timestamps = activity
    .map((a) => new Date(a.timestamp).getTime() / 1000)
    .filter((t) => !isNaN(t));

  // Count trades within same minute
  const minuteBuckets = new Map<number, number>();
  for (const ts of timestamps) {
    const bucket = Math.floor(ts / 60);
    minuteBuckets.set(bucket, (minuteBuckets.get(bucket) ?? 0) + 1);
  }
  const maxInOneMinute = Math.max(...minuteBuckets.values());
  if (maxInOneMinute >= 20) return 90;
  if (maxInOneMinute >= 10) return 70;
  if (maxInOneMinute >= 5) return 40;
  return 10;
}

function diversityScore(activity: PolyActivity[]): number {
  if (activity.length === 0) return 0;

  // Count unique market slugs
  const uniqueMarkets = new Set(activity.map((a) => a.marketSlug)).size;
  const ratio = uniqueMarkets / activity.length;

  // Very low ratio = always same market = bot-like
  if (ratio < 0.02) return 85;
  if (ratio < 0.05) return 60;
  if (ratio < 0.1) return 35;
  return 10;
}

function volumeParadoxScore(winRate: number, totalTrades: number): number {
  if (winRate > 0.9 && totalTrades > 500) return 95;
  if (winRate > 0.9 && totalTrades > 200) return 80;
  if (winRate > 0.85 && totalTrades > 500) return 75;
  if (winRate > 0.8 && totalTrades > 1000) return 65;
  return 10;
}

export function calculateBotScore(
  activity: PolyActivity[],
  transactions: SubgraphTransaction[],
  winRate = 0,
  totalTrades = 0
): BotScore {
  const timing = timingScore(transactions);
  const sizing = sizingScore(activity);
  const speed = speedScore(activity);
  const diversity = diversityScore(activity);
  const paradox = volumeParadoxScore(winRate, totalTrades);

  const total = Math.round(
    timing * 0.25 +
    sizing * 0.25 +
    speed * 0.15 +
    diversity * 0.15 +
    paradox * 0.20
  );

  return {
    total: Math.min(100, Math.max(0, total)),
    timing,
    sizing,
    speed,
    diversity,
    volumeParadox: paradox,
  };
}
