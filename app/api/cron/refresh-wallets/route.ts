import { NextResponse } from "next/server";
import { getTopAccounts } from "@/server/services/subgraphClient";
import { processWallet } from "@/server/services/walletTracker";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await getTopAccounts(200);
  let processed = 0;

  for (let i = 0; i < accounts.length; i += 10) {
    const batch = accounts.slice(i, i + 10);
    await Promise.allSettled(batch.map((acc) => processWallet(acc.id)));
    processed += batch.length;
    await delay(200);
  }

  return NextResponse.json({ ok: true, processed });
}
