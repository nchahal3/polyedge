"use client";
import { useState } from "react";

const ALERT_KEY = "polyedge_alert_email";

export function AlertSignupForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem(ALERT_KEY) ?? "";
    return "";
  });
  const [saved, setSaved] = useState(() => {
    if (typeof window !== "undefined") return !!localStorage.getItem(ALERT_KEY);
    return false;
  });
  const [threshold, setThreshold] = useState(70);

  function save() {
    if (!email.includes("@")) return;
    localStorage.setItem(ALERT_KEY, email);
    setSaved(true);
  }

  function clear() {
    localStorage.removeItem(ALERT_KEY);
    setSaved(false);
    setEmail("");
  }

  if (saved) {
    return (
      <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(0,230,160,0.08)", border: "1px solid rgba(0,230,160,0.2)" }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: "#00e6a0" }}>✓ Alerts active</div>
          <div className="text-xs mt-0.5" style={{ color: "#475569" }}>
            Emailing <span style={{ color: "#94a3b8" }}>{email}</span> when signals ≥{threshold}% strength form
          </div>
        </div>
        <button onClick={clear} className="text-xs font-mono" style={{ color: "#475569" }}>Remove</button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none font-mono"
          style={{ backgroundColor: "#0f1117", border: "1px solid #1e2533", color: "#e2e8f0" }}
        />
        <button
          onClick={save}
          className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
          style={{ backgroundColor: "#00e6a0", color: "#000" }}
        >
          Get Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "rgba(0,230,160,0.2)", backgroundColor: "rgba(0,230,160,0.03)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span>🔔</span>
        <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Get Signal Alerts</h3>
      </div>
      <p className="text-xs mb-4" style={{ color: "#475569" }}>
        Email me when a STRONG consensus forms (no spam, unsubscribe anytime)
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono block mb-1" style={{ color: "#94a3b8" }}>EMAIL</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono"
            style={{ backgroundColor: "#0a0b0f", border: "1px solid #1e2533", color: "#e2e8f0" }}
          />
        </div>
        <div>
          <label className="text-xs font-mono block mb-1" style={{ color: "#94a3b8" }}>
            ALERT THRESHOLD: ≥{threshold}% signal strength
          </label>
          <input
            type="range"
            min={50}
            max={90}
            step={5}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-full accent-emerald-400"
          />
          <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "#475569" }}>
            <span>50% (more alerts)</span>
            <span>90% (fewer, stronger)</span>
          </div>
        </div>
        <button
          onClick={save}
          className="w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "#00e6a0", color: "#000" }}
        >
          Activate Alerts
        </button>
      </div>
    </div>
  );
}
