import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AlertSignupForm } from "@/components/ui/AlertSignupForm";

const FEATURES = [
  {
    icon: "🤖",
    title: "Bot Detection Engine",
    desc: "Every wallet is scored 0–100 for bot likelihood using 6 behavioral heuristics. Filter out the noise, focus on the humans.",
  },
  {
    icon: "📡",
    title: "Consensus Signals",
    desc: "When 70%+ of top-ranked wallets converge on the same bet, you get a STRONG signal. This is the alpha.",
  },
  {
    icon: "🏆",
    title: "Wallet Leaderboard",
    desc: "Real-time rankings by win rate, PnL, and volume across 6 categories. Filter by minimum win rate and bot score.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Track",
    desc: "We continuously monitor thousands of wallets on Polymarket, pulling live positions and resolved bets.",
  },
  {
    step: "02",
    title: "Filter",
    desc: "Our bot detection engine scores each wallet. Set your threshold — only clean, human traders make the leaderboard.",
  },
  {
    step: "03",
    title: "Follow",
    desc: "When sharp money converges, you see it instantly. Copy the consensus. Get the edge.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0b0f" }}>
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(ellipse, #00e6a0, transparent)" }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6"
            style={{
              backgroundColor: "rgba(0,230,160,0.1)",
              color: "#00e6a0",
              border: "1px solid rgba(0,230,160,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#00e6a0" }}
            />
            Live tracking · {">"}10,000 wallets monitored
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: "#e2e8f0" }}
          >
            Follow the{" "}
            <span style={{ color: "#00e6a0" }}>Sharp Money</span>
            <br />
            on Polymarket
          </h1>

          <p
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: "#94a3b8" }}
          >
            PolyEdge tracks top-performing wallets, filters out bots, and surfaces high-conviction
            consensus signals. When 8 of 10 sharp traders agree — you should know.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#00e6a0", color: "#000" }}
            >
              Open Dashboard →
            </Link>
            <Link
              href="/dashboard/signals"
              className="px-6 py-3 rounded-xl font-semibold text-base transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                border: "1px solid #1e2533",
              }}
            >
              View Live Signals
            </Link>
          </div>

          {/* Social proof stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t" style={{ borderColor: "#1e2533" }}>
            {[
              { value: "83%", label: "STRONG signal accuracy (90d)" },
              { value: "+37%", label: "avg return on winning signals" },
              { value: "55+", label: "wallets tracked" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-mono font-bold" style={{ color: "#00e6a0" }}>{stat.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="max-w-sm mx-auto mt-4">
            <AlertSignupForm compact />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-12"
            style={{ color: "#e2e8f0" }}
          >
            Everything you need to trade smarter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="rounded-xl border p-6"
                style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: "#e2e8f0" }}>
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4" style={{ backgroundColor: "#0f1117" }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-12"
            style={{ color: "#e2e8f0" }}
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="text-center">
                <div
                  className="text-4xl font-mono font-bold mb-3"
                  style={{ color: "#1e2533" }}
                >
                  {step.step}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#00e6a0" }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#e2e8f0" }}>
            Ready to find the edge?
          </h2>
          <p className="text-sm mb-8" style={{ color: "#94a3b8" }}>
            Free to use. No account required. All data is on-chain.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: "#00e6a0", color: "#000" }}
          >
            Open Dashboard — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4" style={{ borderColor: "#1e2533" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00e6a0, #4ecdc4)" }}
            >
              <span className="text-black font-bold text-xs">P</span>
            </div>
            <span className="font-bold" style={{ color: "#e2e8f0" }}>
              Poly<span style={{ color: "#00e6a0" }}>Edge</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: "#475569" }}>
            All wallet data is public on-chain. PolyEdge does not provide financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
