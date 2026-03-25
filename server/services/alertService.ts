import type { ConsensusSignal } from "./consensusEngine";
import { getCached, setCached } from "@/lib/redis";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = "alerts@polyedge.app";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function signalEmailHTML(signal: ConsensusSignal): string {
  const strengthPct = Math.round(signal.strength * 100);
  const odds = signal.avgOdds ? `${Math.round(signal.avgOdds * 100)}¢` : "N/A";

  return `
    <div style="font-family: monospace; background: #0a0b0f; color: #e5e7eb; padding: 24px; border-radius: 8px; max-width: 600px;">
      <div style="color: #00e6a0; font-size: 18px; font-weight: bold; margin-bottom: 8px;">
        🔥 ${signal.tier} Consensus Signal — PolyEdge
      </div>
      <div style="background: #1a1b23; border-radius: 6px; padding: 16px; margin: 16px 0;">
        <div style="font-size: 16px; margin-bottom: 8px;">${signal.marketTitle}</div>
        <div style="color: #00e6a0;">Outcome: ${signal.outcome}</div>
        <div style="color: #9ca3af; margin-top: 8px;">
          ${signal.walletCount} of ${signal.totalWallets} top wallets (${strengthPct}%) agree
        </div>
        <div style="color: #9ca3af;">Avg odds: ${odds} · Category: ${signal.category}</div>
      </div>
      <a href="${signal.polymarketUrl}" style="display: inline-block; background: #00e6a0; color: #0a0b0f; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        View on Polymarket →
      </a>
      <div style="color: #4b5563; font-size: 12px; margin-top: 16px;">
        You're receiving this because you signed up for PolyEdge alerts.
      </div>
    </div>
  `;
}

// Call this after recalculating signals to notify subscribers of new STRONG signals
export async function notifyNewStrongSignals(
  signals: ConsensusSignal[],
  subscribers: string[]
): Promise<void> {
  if (!RESEND_API_KEY || subscribers.length === 0) return;

  const strongSignals = signals.filter((s) => s.tier === "STRONG");

  for (const signal of strongSignals) {
    const alertedKey = `alerted:signal:${signal.id}`;
    const alreadyAlerted = await getCached<boolean>(alertedKey);
    if (alreadyAlerted) continue;

    // Send to all subscribers (in real prod, use batch send or BCC)
    for (const email of subscribers) {
      await sendEmail(
        email,
        `🔥 Strong Signal: ${signal.marketTitle} — ${signal.outcome}`,
        signalEmailHTML(signal)
      );
    }

    // Mark as alerted for 24hrs so we don't spam
    await setCached(alertedKey, true, 24 * 60 * 60);
  }
}
