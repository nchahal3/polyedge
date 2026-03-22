"use client";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ACTIVITY_FEED, CATEGORIES, type Category } from "@/lib/mockData";
import { timeAgo } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  new_signal: "📡",
  position_change: "💰",
  wallet_moved_up: "📈",
  bot_cleared: "✅",
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "#ff4757",
  medium: "#ffc542",
  low: "#4ecdc4",
};

export default function FeedPage() {
  const [filter, setFilter] = useState<"all" | "high" | Category>("all");

  const events = ACTIVITY_FEED.filter(e => {
    if (filter === "all") return true;
    if (filter === "high") return e.severity === "high";
    return e.category === filter;
  });

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="max-w-[800px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00e6a0" }} />
              <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>Activity Feed</h1>
            </div>
            <p className="text-sm" style={{ color: "#475569" }}>
              Real-time events: new signals, position changes, wallet movements
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(["all", "high", ...CATEGORIES] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: filter === f ? "#00e6a0" : "rgba(255,255,255,0.04)",
                  color: filter === f ? "#000" : "#94a3b8",
                  border: filter === f ? "none" : "1px solid #1e2533",
                }}
              >
                {f === "all" ? "All Events" : f === "high" ? "🔴 High Priority" : f}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="rounded-xl border py-12 text-center" style={{ borderColor: "#1e2533", backgroundColor: "#0f1117" }}>
                <div className="text-3xl mb-2">📭</div>
                <div className="text-sm" style={{ color: "#94a3b8" }}>No events for this filter</div>
              </div>
            ) : events.map(event => (
              <div
                key={event.id}
                className="rounded-xl border p-4"
                style={{
                  borderColor: event.severity === "high" ? "rgba(255,71,87,0.25)" : "#1e2533",
                  backgroundColor: event.severity === "high" ? "rgba(255,71,87,0.03)" : "#0f1117",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{TYPE_ICONS[event.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{event.title}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{
                        color: SEVERITY_COLORS[event.severity],
                        backgroundColor: SEVERITY_COLORS[event.severity] + "18",
                      }}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "#94a3b8" }}>{event.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-mono" style={{ color: "#475569" }}>
                      <span>{event.category}</span>
                      <span>·</span>
                      <span>{timeAgo(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
