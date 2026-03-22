import { truncateAddress } from "./utils";

export type Category =
  | "Politics"
  | "Sports"
  | "Crypto"
  | "Iran"
  | "Finance"
  | "Geopolitics"
  | "Culture"
  | "Economy"
  | "Weather";

export const CATEGORIES: Category[] = [
  "Politics",
  "Sports",
  "Crypto",
  "Iran",
  "Finance",
  "Geopolitics",
  "Culture",
  "Economy",
  "Weather",
];

export interface MockWallet {
  id: string;
  address: string;
  alias: string | null;
  verified: boolean;
  botScore: number;
  winRate: number;
  totalBets: number;
  resolvedBets: number;
  pnl: number;
  totalVolume: number;
  activeBets: number;
  winStreak: number;
  lastActive: Date;
  categories: Category[];
  activeTrades: MockActiveTrade[];
  snapshots: { date: Date; winRate: number; pnl: number }[];
  botBreakdown: BotBreakdown;
  tradeHistory: MockTradeHistory[];
  categoryBreakdown: { category: Category; pct: number; bets: number }[];
}

export interface BotBreakdown {
  timing: number;
  sizing: number;
  speed: number;
  diversity: number;
  gas: number;
  volumeParadox: number;
}

export interface MockActiveTrade {
  marketId: string;
  marketTitle: string;
  polymarketUrl: string;
  outcome: "YES" | "NO";
  odds: number;
  amount: number;
  category: Category;
}

export interface MockTradeHistory {
  id: string;
  marketTitle: string;
  polymarketUrl: string;
  outcome: "YES" | "NO";
  amount: number;
  result: "won" | "lost" | "pending";
  pnl: number | null;
  date: Date;
  category: Category;
}

export interface MockSignal {
  id: string;
  marketId: string;
  marketTitle: string;
  polymarketUrl: string;
  outcome: "YES" | "NO";
  category: Category;
  strength: number;
  tier: "STRONG" | "MODERATE" | "WEAK";
  walletCount: number;
  totalWallets: number;
  currentOdds: number;
  totalVolume: number;
  walletAliases: string[];
  formedAt: Date;
}

// Seed-based random for reproducibility
function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

const ALIASES = [
  "SharpeRatio", "AlphaSeeker", "EdgeFinder", "OddsWhisperer", "SignalMaker",
  "MarketSage", "BetGenius", "ProbWizard", "EdgeHunter", "QuietMoney",
  "SharpEye", "ValuePlay", "SmartBet", "InfoEdge", "DataDriven",
  "CalcRisk", "PrecisionBet", "TrueOdds", "SignalPro", "WiseMoney",
  "BetaHunter", "ArbitrageKing", "ModelBuilder", "StatEdge", "ProbMaster",
  "MarketWhiz", "InsightPro", "EdgeTrader", "SharpMind", "ValueHunter",
  "PrecisionPro", "OddsHacker", "SignalQueen", "DataEdge", "BetSmarter",
  "WinStreaker", "SharpCapital", "EdgeCapital", "ProbEdge", "MarketMind",
  "TrueValue", "SharpStack", "BetAlpha", "OddsAlpha", "SignalEdge",
  "WiseCap", "InfoArb", "ModelPro", "ValueMind", "SharpAlpha",
];

// In Phase 3 these will be real market URLs from the Polymarket API.
// For mock data we fall back to the browse page so links don't 404.
function polyUrl(_slug: string): string {
  return "https://polymarket.com/markets";
}

const MARKETS: { id: string; title: string; category: Category; yesOdds: number; url: string }[] = [
  // Sports
  { id: "m1",  title: "Lakers win NBA Championship 2025",            category: "Sports",      yesOdds: 0.18, url: polyUrl("lakers-win-nba-championship-2025") },
  { id: "m2",  title: "Chiefs win Super Bowl LX",                    category: "Sports",      yesOdds: 0.31, url: polyUrl("chiefs-win-super-bowl-lx") },
  { id: "m11", title: "Celtics win NBA Finals 2025",                 category: "Sports",      yesOdds: 0.28, url: polyUrl("celtics-win-nba-finals-2025") },
  { id: "m15", title: "Djokovic wins French Open 2025",              category: "Sports",      yesOdds: 0.34, url: polyUrl("djokovic-wins-french-open-2025") },
  // Politics
  { id: "m3",  title: "Trump approval rating above 50% by June",    category: "Politics",    yesOdds: 0.42, url: polyUrl("trump-approval-above-50-by-june-2025") },
  { id: "m10", title: "Democrats win 2026 midterms House majority",  category: "Politics",    yesOdds: 0.48, url: polyUrl("democrats-win-2026-midterms-house-majority") },
  { id: "m16", title: "UK snap election called before July 2025",    category: "Politics",    yesOdds: 0.22, url: polyUrl("uk-snap-election-called-before-july-2025") },
  { id: "m21", title: "Biden endorses 2028 Democratic nominee",      category: "Politics",    yesOdds: 0.37, url: polyUrl("biden-endorses-2028-democratic-nominee") },
  // Crypto
  { id: "m5",  title: "Bitcoin above $100k by end of Q2",           category: "Crypto",      yesOdds: 0.55, url: polyUrl("bitcoin-above-100k-end-of-q2-2025") },
  { id: "m6",  title: "Ethereum ETF approved by SEC",                category: "Crypto",      yesOdds: 0.73, url: polyUrl("ethereum-etf-approved-by-sec") },
  { id: "m12", title: "Solana above $300 by June 2025",             category: "Crypto",      yesOdds: 0.51, url: polyUrl("solana-above-300-by-june-2025") },
  { id: "m14", title: "AI token market cap hits $500B",              category: "Crypto",      yesOdds: 0.44, url: polyUrl("ai-token-market-cap-hits-500b") },
  // Finance
  { id: "m4",  title: "Fed cuts rates in May 2025",                  category: "Finance",     yesOdds: 0.67, url: polyUrl("fed-cuts-rates-may-2025") },
  { id: "m9",  title: "Apple market cap exceeds $4T",                category: "Finance",     yesOdds: 0.44, url: polyUrl("apple-market-cap-exceeds-4-trillion") },
  { id: "m13", title: "US enters recession in 2025",                 category: "Finance",     yesOdds: 0.29, url: polyUrl("us-enters-recession-2025") },
  { id: "m19", title: "Gold above $3500/oz by year end",             category: "Finance",     yesOdds: 0.39, url: polyUrl("gold-above-3500-per-oz-by-year-end-2025") },
  { id: "m20", title: "NVIDIA market cap above $4T",                 category: "Finance",     yesOdds: 0.47, url: polyUrl("nvidia-market-cap-above-4-trillion") },
  // Iran
  { id: "m22", title: "Iran nuclear deal reached in 2025",           category: "Iran",        yesOdds: 0.29, url: polyUrl("iran-nuclear-deal-reached-2025") },
  { id: "m23", title: "US imposes new Iran sanctions by Q3",         category: "Iran",        yesOdds: 0.61, url: polyUrl("us-new-iran-sanctions-by-q3-2025") },
  { id: "m24", title: "Iran enrichment above 90% confirmed",         category: "Iran",        yesOdds: 0.35, url: polyUrl("iran-enrichment-above-90-percent-confirmed") },
  // Geopolitics
  { id: "m8",  title: "Ukraine ceasefire agreement by July 2025",   category: "Geopolitics", yesOdds: 0.38, url: polyUrl("ukraine-ceasefire-agreement-by-july-2025") },
  { id: "m25", title: "NATO adds new member state in 2025",          category: "Geopolitics", yesOdds: 0.42, url: polyUrl("nato-adds-new-member-state-2025") },
  { id: "m26", title: "China invades Taiwan before 2026",            category: "Geopolitics", yesOdds: 0.08, url: polyUrl("china-invades-taiwan-before-2026") },
  // Culture
  { id: "m7",  title: "Oscars 2025 Best Picture: Anora",            category: "Culture",     yesOdds: 0.62, url: polyUrl("oscars-2025-best-picture-anora") },
  { id: "m17", title: "Taylor Swift announces new album 2025",       category: "Culture",     yesOdds: 0.71, url: polyUrl("taylor-swift-new-album-2025") },
  { id: "m27", title: "GTA VI releases in 2025",                     category: "Culture",     yesOdds: 0.83, url: polyUrl("gta-vi-releases-in-2025") },
  // Economy
  { id: "m18", title: "US unemployment above 5% by Q4",             category: "Economy",     yesOdds: 0.33, url: polyUrl("us-unemployment-above-5-percent-q4-2025") },
  { id: "m28", title: "CPI inflation below 2.5% by June",           category: "Economy",     yesOdds: 0.54, url: polyUrl("cpi-inflation-below-2-5-percent-by-june-2025") },
  { id: "m29", title: "S&P 500 above 6500 by year end",             category: "Economy",     yesOdds: 0.61, url: polyUrl("sp-500-above-6500-by-year-end-2025") },
  // Weather
  { id: "m30", title: "2025 hurricane season above average",        category: "Weather",     yesOdds: 0.58, url: polyUrl("2025-hurricane-season-above-average") },
  { id: "m31", title: "Record global temp set in 2025",             category: "Weather",     yesOdds: 0.74, url: polyUrl("record-global-temperature-set-in-2025") },
];


// Suppress unused warning — pickRandom is used in generateWallet
void pickRandom;

function generateWallet(index: number, rng: () => number): MockWallet {
  const address = `0x${Array.from({ length: 40 }, (_, i) => ((index * 997 + i * 31) % 16).toString(16)).join("")}`;
  const alias = rng() > 0.3 ? ALIASES[index % ALIASES.length] : null;
  const verified = rng() > 0.7;

  // Bot score distribution: most wallets should be low (we want "clean" leaderboard)
  const botScore = Math.round(
    index < 10 ? rng() * 15 : // top 10: very clean
    index < 25 ? rng() * 30 : // next 15: low risk
    index < 40 ? rng() * 60 : // next 15: moderate
    30 + rng() * 70             // rest: mixed
  );

  const winRate = Math.round(
    index < 5 ? 82 + rng() * 13 : // top 5: elite
    index < 15 ? 72 + rng() * 13 : // next 10: strong
    index < 30 ? 62 + rng() * 15 : // next 15: decent
    50 + rng() * 20               // rest: average
  );

  const resolvedBets = Math.floor(20 + rng() * 580);
  const totalBets = resolvedBets + Math.floor(rng() * 20);
  const activeBets = Math.floor(rng() * 12) + 1;
  const pnl = Math.round((winRate / 100 - 0.45) * resolvedBets * (200 + rng() * 800));
  const totalVolume = Math.round(resolvedBets * (150 + rng() * 850));
  const winStreak = Math.floor(rng() * 12);
  const lastActive = new Date(Date.now() - Math.floor(rng() * 3600000 * 48));

  const numCategories = Math.floor(1 + rng() * 4);
  const shuffledCats = [...CATEGORIES].sort(() => rng() - 0.5);
  const categories = shuffledCats.slice(0, numCategories) as Category[];

  const activeTrades: MockActiveTrade[] = Array.from({ length: activeBets }, () => {
    const market = MARKETS[Math.floor(rng() * MARKETS.length)];
    const outcome = rng() > 0.4 ? "YES" : "NO";
    return {
      marketId: market.id,
      marketTitle: market.title,
      polymarketUrl: market.url,
      outcome,
      odds: Math.round((outcome === "YES" ? market.yesOdds : 1 - market.yesOdds) * 100) / 100,
      amount: Math.round(50 + rng() * 2000),
      category: market.category,
    };
  });

  const snapshots = Array.from({ length: 90 }, (_, i) => ({
    date: new Date(Date.now() - (89 - i) * 86400000),
    winRate: Math.max(40, Math.min(99, winRate + (rng() - 0.5) * 10)),
    pnl: pnl * ((i + 1) / 90) + (rng() - 0.5) * 500,
  }));

  const botBreakdown: BotBreakdown = {
    timing: Math.round(Math.min(100, botScore * (0.8 + rng() * 0.4))),
    sizing: Math.round(Math.min(100, botScore * (0.8 + rng() * 0.4))),
    speed: Math.round(Math.min(100, botScore * (0.8 + rng() * 0.4))),
    diversity: Math.round(Math.min(100, botScore * (0.8 + rng() * 0.4))),
    gas: Math.round(Math.min(100, botScore * (0.8 + rng() * 0.4))),
    volumeParadox: Math.round(Math.min(100, botScore * (0.8 + rng() * 0.4))),
  };

  const tradeHistory: MockTradeHistory[] = Array.from({ length: Math.min(resolvedBets, 50) }, (_, i) => {
    const market = MARKETS[Math.floor(rng() * MARKETS.length)];
    const outcome = rng() > 0.4 ? "YES" : "NO";
    const won = rng() * 100 < winRate;
    const amount = Math.round(50 + rng() * 1500);
    return {
      id: `t${index}-${i}`,
      marketTitle: market.title,
      polymarketUrl: market.url,
      outcome,
      amount,
      result: i < 5 ? "pending" : won ? "won" : "lost",
      pnl: i < 5 ? null : won ? Math.round(amount * (0.5 + rng())) : -amount,
      date: new Date(Date.now() - Math.floor(rng() * 30 * 86400000)),
      category: market.category,
    };
  });

  const catBets = categories.map((cat) => ({
    category: cat,
    bets: Math.floor(resolvedBets * (0.1 + rng() * 0.4)),
    pct: 0,
  }));
  const total = catBets.reduce((s, c) => s + c.bets, 0);
  catBets.forEach(c => { c.pct = Math.round((c.bets / total) * 100); });

  return {
    id: `wallet-${index}`,
    address,
    alias,
    verified,
    botScore,
    winRate,
    totalBets,
    resolvedBets,
    pnl,
    totalVolume,
    activeBets,
    winStreak,
    lastActive,
    categories,
    activeTrades,
    snapshots,
    botBreakdown,
    tradeHistory,
    categoryBreakdown: catBets,
  };
}

const rng = seededRandom(42);
export const MOCK_WALLETS: MockWallet[] = Array.from({ length: 55 }, (_, i) => generateWallet(i, rng));

// Generate consensus signals
export const MOCK_SIGNALS: MockSignal[] = [
  { id: "sig1",  marketId: "m6",  marketTitle: "Ethereum ETF approved by SEC",                polymarketUrl: polyUrl("ethereum-etf-approved-by-sec"),                 outcome: "YES", category: "Crypto",      strength: 0.82, tier: "STRONG",   walletCount: 9, totalWallets: 11, currentOdds: 0.73, totalVolume: 48200, walletAliases: ["SharpeRatio","AlphaSeeker","EdgeFinder","OddsWhisperer","SignalMaker","MarketSage","BetGenius","ProbWizard","EdgeHunter"],                                       formedAt: new Date(Date.now() - 3600000 * 2) },
  { id: "sig2",  marketId: "m4",  marketTitle: "Fed cuts rates in May 2025",                   polymarketUrl: polyUrl("fed-cuts-rates-may-2025"),                       outcome: "YES", category: "Finance",     strength: 0.77, tier: "STRONG",   walletCount: 8, totalWallets: 10, currentOdds: 0.67, totalVolume: 62100, walletAliases: ["QuietMoney","SharpEye","ValuePlay","SmartBet","InfoEdge","DataDriven","CalcRisk","PrecisionBet"],                                                         formedAt: new Date(Date.now() - 3600000 * 5) },
  { id: "sig3",  marketId: "m5",  marketTitle: "Bitcoin above $100k by end of Q2",             polymarketUrl: polyUrl("bitcoin-above-100k-end-of-q2-2025"),            outcome: "YES", category: "Crypto",      strength: 0.72, tier: "STRONG",   walletCount: 8, totalWallets: 11, currentOdds: 0.55, totalVolume: 91500, walletAliases: ["TrueOdds","SignalPro","WiseMoney","BetaHunter","ArbitrageKing","ModelBuilder","StatEdge","ProbMaster"],                                                    formedAt: new Date(Date.now() - 3600000 * 8) },
  { id: "sig4",  marketId: "m8",  marketTitle: "Ukraine ceasefire agreement by July 2025",     polymarketUrl: polyUrl("ukraine-ceasefire-agreement-by-july-2025"),     outcome: "YES", category: "Geopolitics", strength: 0.65, tier: "MODERATE", walletCount: 7, totalWallets: 11, currentOdds: 0.38, totalVolume: 28900, walletAliases: ["MarketWhiz","InsightPro","EdgeTrader","SharpMind","ValueHunter","PrecisionPro","OddsHacker"],                                                        formedAt: new Date(Date.now() - 3600000 * 12) },
  { id: "sig5",  marketId: "m7",  marketTitle: "Oscars 2025 Best Picture: Anora",              polymarketUrl: polyUrl("oscars-2025-best-picture-anora"),               outcome: "YES", category: "Culture",     strength: 0.59, tier: "MODERATE", walletCount: 6, totalWallets: 10, currentOdds: 0.62, totalVolume: 19400, walletAliases: ["SignalQueen","DataEdge","BetSmarter","WinStreaker","SharpCapital","EdgeCapital"],                                                                 formedAt: new Date(Date.now() - 3600000 * 18) },
  { id: "sig6",  marketId: "m2",  marketTitle: "Chiefs win Super Bowl LX",                     polymarketUrl: polyUrl("chiefs-win-super-bowl-lx"),                     outcome: "YES", category: "Sports",      strength: 0.55, tier: "MODERATE", walletCount: 6, totalWallets: 11, currentOdds: 0.31, totalVolume: 43800, walletAliases: ["ProbEdge","MarketMind","TrueValue","SharpStack","BetAlpha","OddsAlpha"],                                                                         formedAt: new Date(Date.now() - 3600000 * 24) },
  { id: "sig7",  marketId: "m3",  marketTitle: "Trump approval rating above 50% by June",     polymarketUrl: polyUrl("trump-approval-above-50-by-june-2025"),         outcome: "NO",  category: "Politics",    strength: 0.71, tier: "STRONG",   walletCount: 8, totalWallets: 11, currentOdds: 0.58, totalVolume: 55300, walletAliases: ["SignalEdge","WiseCap","InfoArb","ModelPro","ValueMind","SharpAlpha","SharpeRatio","AlphaSeeker"],                                                      formedAt: new Date(Date.now() - 3600000 * 6) },
  { id: "sig8a", marketId: "m23", marketTitle: "US imposes new Iran sanctions by Q3",          polymarketUrl: polyUrl("us-new-iran-sanctions-by-q3-2025"),             outcome: "YES", category: "Iran",        strength: 0.73, tier: "STRONG",   walletCount: 8, totalWallets: 11, currentOdds: 0.61, totalVolume: 31200, walletAliases: ["EdgeFinder","OddsWhisperer","SignalMaker","MarketSage","BetGenius","ProbWizard","EdgeHunter","QuietMoney"],                                      formedAt: new Date(Date.now() - 3600000 * 4) },
  { id: "sig9",  marketId: "m28", marketTitle: "CPI inflation below 2.5% by June",            polymarketUrl: polyUrl("cpi-inflation-below-2-5-percent-by-june-2025"), outcome: "YES", category: "Economy",     strength: 0.61, tier: "MODERATE", walletCount: 7, totalWallets: 11, currentOdds: 0.54, totalVolume: 44100, walletAliases: ["SharpEye","ValuePlay","SmartBet","InfoEdge","DataDriven","CalcRisk","PrecisionBet"],                                                          formedAt: new Date(Date.now() - 3600000 * 9) },
  { id: "sig10", marketId: "m31", marketTitle: "Record global temp set in 2025",               polymarketUrl: polyUrl("record-global-temperature-set-in-2025"),        outcome: "YES", category: "Weather",     strength: 0.76, tier: "STRONG",   walletCount: 8, totalWallets: 10, currentOdds: 0.74, totalVolume: 22800, walletAliases: ["TrueOdds","SignalPro","WiseMoney","BetaHunter","ArbitrageKing","ModelBuilder","StatEdge","ProbMaster"],                                           formedAt: new Date(Date.now() - 3600000 * 3) },
  { id: "sig11", marketId: "m14", marketTitle: "AI token market cap hits $500B",               polymarketUrl: polyUrl("ai-token-market-cap-hits-500b"),                outcome: "YES", category: "Crypto",      strength: 0.63, tier: "MODERATE", walletCount: 7, totalWallets: 11, currentOdds: 0.61, totalVolume: 38700, walletAliases: ["EdgeFinder","OddsWhisperer","SignalMaker","MarketSage","BetGenius","ProbWizard","EdgeHunter"],                                                   formedAt: new Date(Date.now() - 3600000 * 10) },
];

export interface ResolvedSignal {
  id: string;
  marketTitle: string;
  polymarketUrl: string;
  outcome: "YES" | "NO";
  category: Category;
  tier: "STRONG" | "MODERATE";
  strength: number;
  walletCount: number;
  totalWallets: number;
  resolvedAt: Date;
  result: "correct" | "wrong";
  finalOdds: number;
  pnlIfFollowed: number; // % gain if you bet $100 on this signal
}

export const RESOLVED_SIGNALS: ResolvedSignal[] = [
  { id: "r1",  marketTitle: "Super Bowl LVIII — Chiefs win",          polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Sports",      tier: "STRONG",   strength: 0.78, walletCount: 9,  totalWallets: 11, resolvedAt: new Date("2025-02-15"), result: "correct", finalOdds: 0.68, pnlIfFollowed: 47 },
  { id: "r2",  marketTitle: "Fed pauses rate hikes in March",         polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Finance",     tier: "STRONG",   strength: 0.82, walletCount: 10, totalWallets: 12, resolvedAt: new Date("2025-03-01"), result: "correct", finalOdds: 0.74, pnlIfFollowed: 35 },
  { id: "r3",  marketTitle: "Bitcoin above $90k by Feb end",          polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Crypto",      tier: "STRONG",   strength: 0.73, walletCount: 8,  totalWallets: 11, resolvedAt: new Date("2025-02-28"), result: "correct", finalOdds: 0.61, pnlIfFollowed: 64 },
  { id: "r4",  marketTitle: "Ukraine peace talks begin by March",     polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Geopolitics", tier: "MODERATE", strength: 0.58, walletCount: 6,  totalWallets: 10, resolvedAt: new Date("2025-03-10"), result: "wrong",   finalOdds: 0.42, pnlIfFollowed: -100 },
  { id: "r5",  marketTitle: "Trump executive order on AI by Feb",     polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Politics",    tier: "STRONG",   strength: 0.75, walletCount: 9,  totalWallets: 12, resolvedAt: new Date("2025-02-20"), result: "correct", finalOdds: 0.81, pnlIfFollowed: 23 },
  { id: "r6",  marketTitle: "Solana above $250 by March 1",           polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Crypto",      tier: "STRONG",   strength: 0.80, walletCount: 9,  totalWallets: 11, resolvedAt: new Date("2025-03-01"), result: "correct", finalOdds: 0.72, pnlIfFollowed: 39 },
  { id: "r7",  marketTitle: "Oscars host announced before Feb 1",     polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Culture",     tier: "MODERATE", strength: 0.54, walletCount: 6,  totalWallets: 11, resolvedAt: new Date("2025-01-28"), result: "correct", finalOdds: 0.88, pnlIfFollowed: 14 },
  { id: "r8",  marketTitle: "Nasdaq above 20k by March 15",           polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Economy",     tier: "STRONG",   strength: 0.71, walletCount: 8,  totalWallets: 11, resolvedAt: new Date("2025-03-15"), result: "wrong",   finalOdds: 0.38, pnlIfFollowed: -100 },
  { id: "r9",  marketTitle: "Iran nuclear talks resume in Q1",        polymarketUrl: "https://polymarket.com/markets", outcome: "NO",  category: "Iran",        tier: "STRONG",   strength: 0.76, walletCount: 9,  totalWallets: 12, resolvedAt: new Date("2025-03-18"), result: "correct", finalOdds: 0.69, pnlIfFollowed: 45 },
  { id: "r10", marketTitle: "Record snowfall in Northeast US Feb",    polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Weather",     tier: "MODERATE", strength: 0.61, walletCount: 7,  totalWallets: 11, resolvedAt: new Date("2025-02-22"), result: "correct", finalOdds: 0.77, pnlIfFollowed: 30 },
  { id: "r11", marketTitle: "Celtics clinch playoff spot by March",   polymarketUrl: "https://polymarket.com/markets", outcome: "YES", category: "Sports",      tier: "MODERATE", strength: 0.62, walletCount: 7,  totalWallets: 11, resolvedAt: new Date("2025-03-08"), result: "correct", finalOdds: 0.83, pnlIfFollowed: 20 },
  { id: "r12", marketTitle: "Apple Vision Pro 2 announced at WWDC",   polymarketUrl: "https://polymarket.com/markets", outcome: "NO",  category: "Culture",     tier: "STRONG",   strength: 0.74, walletCount: 8,  totalWallets: 10, resolvedAt: new Date("2025-02-10"), result: "correct", finalOdds: 0.71, pnlIfFollowed: 41 },
];

export function getSignalAccuracy() {
  const strong = RESOLVED_SIGNALS.filter(s => s.tier === "STRONG");
  const strongCorrect = strong.filter(s => s.result === "correct").length;
  const all = RESOLVED_SIGNALS;
  const allCorrect = all.filter(s => s.result === "correct").length;
  const avgPnl = RESOLVED_SIGNALS.filter(s => s.result === "correct")
    .reduce((sum, s) => sum + s.pnlIfFollowed, 0) / RESOLVED_SIGNALS.filter(s => s.result === "correct").length;
  return {
    strongAccuracy: Math.round((strongCorrect / strong.length) * 100),
    overallAccuracy: Math.round((allCorrect / all.length) * 100),
    totalResolved: all.length,
    avgPnlOnWins: Math.round(avgPnl),
  };
}

export interface ActivityEvent {
  id: string;
  type: "new_signal" | "position_change" | "wallet_moved_up" | "bot_cleared";
  title: string;
  description: string;
  category: Category;
  timestamp: Date;
  severity: "high" | "medium" | "low";
}

export const ACTIVITY_FEED: ActivityEvent[] = [
  { id: "a1",  type: "new_signal",       title: "New STRONG signal formed",            description: "9/11 sharp wallets now betting YES on Ethereum ETF — 82% consensus",     category: "Crypto",      timestamp: new Date(Date.now() - 3600000 * 2),  severity: "high" },
  { id: "a2",  type: "new_signal",       title: "STRONG signal: Iran sanctions",       description: "8/11 wallets agree US sanctions incoming — signal strength 73%",           category: "Iran",        timestamp: new Date(Date.now() - 3600000 * 4),  severity: "high" },
  { id: "a3",  type: "position_change",  title: "SharpeRatio added large position",    description: "$2,400 bet on Fed rate cut (YES) — 67¢ odds on Finance market",            category: "Finance",     timestamp: new Date(Date.now() - 3600000 * 6),  severity: "medium" },
  { id: "a4",  type: "wallet_moved_up",  title: "AlphaSeeker climbed to #2",           description: "Win rate improved from 81% to 87% after 3 consecutive wins this week",     category: "Crypto",      timestamp: new Date(Date.now() - 3600000 * 8),  severity: "low" },
  { id: "a5",  type: "new_signal",       title: "Weather signal strengthening",        description: "6/10 wallets now on YES for record global temps — signal moving to STRONG", category: "Weather",     timestamp: new Date(Date.now() - 3600000 * 10), severity: "medium" },
  { id: "a6",  type: "bot_cleared",      title: "WiseMoney reclassified to CLEAN",     description: "Bot score dropped from 32 → 12 after 2 weeks of irregular timing patterns", category: "Politics",    timestamp: new Date(Date.now() - 3600000 * 14), severity: "low" },
  { id: "a7",  type: "position_change",  title: "Multiple wallets exiting Sports bets", description: "3 top-10 wallets closed NBA positions — watch for signal dissolution",   category: "Sports",      timestamp: new Date(Date.now() - 3600000 * 18), severity: "medium" },
  { id: "a8",  type: "new_signal",       title: "Politics signal: Trump approval",     description: "8/11 wallets on NO for >50% approval by June — 71% STRONG consensus",      category: "Politics",    timestamp: new Date(Date.now() - 3600000 * 24), severity: "high" },
  { id: "a9",  type: "wallet_moved_up",  title: "EdgeFinder hit 15-win streak",        description: "Top Crypto wallet now on a 15-game winning streak — watch closely",         category: "Crypto",      timestamp: new Date(Date.now() - 3600000 * 28), severity: "medium" },
  { id: "a10", type: "position_change",  title: "BetGenius doubled down on Bitcoin",   description: "$1,800 additional position on BTC >$100k — now $3,200 total exposure",      category: "Crypto",      timestamp: new Date(Date.now() - 3600000 * 36), severity: "medium" },
];

export function getWalletsByCategory(category: Category | "all", maxBotScore: number, minWinRate: number, topN: number): MockWallet[] {
  return MOCK_WALLETS
    .filter(w =>
      (category === "all" || w.categories.includes(category)) &&
      w.botScore <= maxBotScore &&
      w.winRate >= minWinRate &&
      w.resolvedBets >= 20
    )
    .slice(0, topN);
}

export function getSignalsByCategory(category: Category | "all"): MockSignal[] {
  if (category === "all") return MOCK_SIGNALS;
  return MOCK_SIGNALS.filter(s => s.category === category);
}
