"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WalletLeaderboard } from "@/components/dashboard/WalletLeaderboard";
import { ConsensusPanel } from "@/components/dashboard/ConsensusPanel";
import { CATEGORIES, MOCK_WALLETS, MOCK_SIGNALS, type Category } from "@/lib/mockData";
import { formatVolume } from "@/lib/utils";
import Link from "next/link";

const CATEGORY_ICONS: Record<Category, string> = {
  Politics: "🏛️", Sports: "⚽", Crypto: "₿", Iran: "🇮🇷",
  Finance: "📈", Geopolitics: "🌐", Culture: "🎬", Economy: "💹", Weather: "🌩️",
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = CATEGORIES.find(c => c.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
  if (!category) notFound();

  const wallets = MOCK_WALLETS
    .filter(w => w.categories.includes(category) && w.botScore <= 30 && w.resolvedBets >= 20)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 15);

  const signals = MOCK_SIGNALS.filter(s => s.category === category);
  const totalVolume = wallets.reduce((s, w) => s + w.totalVolume, 0);
  const avgWinRate = wallets.length ? (wallets.reduce((s, w) => s + w.winRate, 0) / wallets.length).toFixed(1) : "0";
  const strongSignals = signals.filter(s => s.tier === "STRONG").length;

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "#475569" }}>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>›</span>
            <span style={{ color: "#94a3b8" }}>{category}</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-4">
            <span className="text-4xl">{CATEGORY_ICONS[category]}</span>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#e2e8f0" }}>{category}</h1>
              <p className="text-sm mt-0.5" style={{ color: "#475569" }}>
                {wallets.length} tracked wallets · {signals.length} active signal{signals.length !== 1 ? "s" : ""}
              </p>
            </div>
            {strongSignals > 0 && (
              <span className="ml-auto text-xs font-mono font-bold px-3 py-1.5 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(255,71,87,0.15)", color: "#ff4757", border: "1px solid rgba(255,71,87,0.3)" }}>
                {strongSignals} STRONG SIGNAL{strongSignals > 1 ? "S" : ""}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "WALLETS TRACKED", value: wallets.length.toString(), color: "#4ecdc4" },
              { label: "AVG WIN RATE", value: `${avgWinRate}%`, color: "#00e6a0" },
              { label: "TOTAL VOLUME", value: formatVolume(totalVolume), color: "#4ecdc4" },
              { label: "ACTIVE SIGNALS", value: signals.length.toString(), sub: strongSignals > 0 ? `${strongSignals} STRONG` : undefined, color: strongSignals > 0 ? "#ff4757" : "#94a3b8" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-4 border" style={{ backgroundColor: "#0f1117", borderColor: "#1e2533" }}>
                <div className="text-xs font-mono mb-1" style={{ color: "#475569" }}>{stat.label}</div>
                <div className="text-2xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</div>
                {stat.sub && <div className="text-xs font-mono mt-0.5" style={{ color: stat.color }}>{stat.sub}</div>}
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
            <div>
              <div className="text-sm font-mono font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
                Top Wallets in {category}
              </div>
              <WalletLeaderboard wallets={wallets} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                {signals.some(s => s.tier === "STRONG") && (
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#ff4757" }} />
                )}
                <div className="text-sm font-mono font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                  Active Signals
                </div>
              </div>
              <ConsensusPanel signals={signals} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
