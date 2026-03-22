"use client";
import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Welcome to PolyEdge",
    body: "Track the smartest wallets on Polymarket. We filter out bots and surface high-conviction consensus signals.",
    emoji: "👋",
  },
  {
    title: "The Wallet Leaderboard",
    body: "Ranked by win rate. Every wallet has a Bot Score — CLEAN wallets (0–15) are almost certainly human traders with real edge.",
    emoji: "🏆",
  },
  {
    title: "Consensus Signals",
    body: "When 70%+ of top wallets bet the same way on the same market, it's a STRONG signal. These are highlighted in red on the right panel.",
    emoji: "📡",
  },
  {
    title: "Use the filters",
    body: "Set your Min Win Rate and Max Bot Score to customize the leaderboard. Higher win rate + lower bot score = sharper humans.",
    emoji: "⚙️",
  },
];

const TOUR_KEY = "polyedge_tour_seen_v1";

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  }

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl border p-7 shadow-2xl" style={{ backgroundColor: "#0f1117", borderColor: "#1e2533" }}>
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ backgroundColor: i <= step ? "#00e6a0" : "#1e2533" }} />
          ))}
        </div>

        <div className="text-4xl mb-4">{current.emoji}</div>
        <h2 className="text-lg font-bold mb-2" style={{ color: "#e2e8f0" }}>{current.title}</h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#94a3b8" }}>{current.body}</p>

        <div className="flex items-center justify-between">
          <button onClick={dismiss} className="text-xs font-mono" style={{ color: "#475569" }}>
            Skip tour
          </button>
          <button
            onClick={next}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#00e6a0", color: "#000" }}
          >
            {step < STEPS.length - 1 ? "Next →" : "Get started →"}
          </button>
        </div>
      </div>
    </div>
  );
}
