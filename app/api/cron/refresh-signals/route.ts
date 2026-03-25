import { NextResponse } from "next/server";
import { calculateConsensusSignals } from "@/server/services/consensusEngine";

const CATEGORIES = ["all", "Politics", "Sports", "Crypto", "Finance", "Geopolitics", "Culture", "Economy", "Weather"];

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filters = { minWinRate: 55, maxBotScore: 40, topN: 20 };

  await Promise.allSettled(
    CATEGORIES.map((cat) => calculateConsensusSignals(cat, filters))
  );

  return NextResponse.json({ ok: true, categories: CATEGORIES.length });
}
