import { formatVolume } from "@/lib/utils";
import type { MockWallet, MockSignal } from "@/lib/mockData";

interface StatsRowProps {
  wallets: MockWallet[];
  signals: MockSignal[];
}

export function StatsRow({ wallets, signals }: StatsRowProps) {
  const avgWinRate =
    wallets.length > 0
      ? (wallets.reduce((s, w) => s + w.winRate, 0) / wallets.length).toFixed(1)
      : "0.0";
  const totalVolume = wallets.reduce((s, w) => s + w.totalVolume, 0);
  const strongSignals = signals.filter(s => s.tier === "STRONG").length;

  const stats = [
    { label: "WALLETS TRACKED", value: wallets.length.toString(), color: "#4ecdc4" },
    { label: "AVG WIN RATE", value: `${avgWinRate}%`, color: "#00e6a0" },
    { label: "TOTAL VOLUME", value: formatVolume(totalVolume), color: "#4ecdc4" },
    {
      label: "ACTIVE SIGNALS",
      value: signals.length.toString(),
      sub: strongSignals > 0 ? `${strongSignals} STRONG` : undefined,
      color: strongSignals > 0 ? "#ff4757" : "#94a3b8",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="rounded-xl p-4 border"
          style={{ backgroundColor: "#0f1117", borderColor: "#1e2533" }}
        >
          <div className="text-xs font-mono mb-1" style={{ color: "#475569" }}>
            {stat.label}
          </div>
          <div className="text-2xl font-mono font-bold" style={{ color: stat.color }}>
            {stat.value}
          </div>
          {stat.sub && (
            <div className="text-xs font-mono mt-0.5" style={{ color: stat.color }}>
              {stat.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
