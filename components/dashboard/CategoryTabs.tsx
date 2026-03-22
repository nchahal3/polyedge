"use client";
import Link from "next/link";
import { CATEGORIES, type Category } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<Category | "all", string> = {
  all: "◈",
  Politics: "🏛️",
  Sports: "⚽",
  Crypto: "₿",
  Iran: "🇮🇷",
  Finance: "📈",
  Geopolitics: "🌐",
  Culture: "🎬",
  Economy: "💹",
  Weather: "🌩️",
};

type ActiveCategory = Category | "all";

interface CategoryTabsProps {
  active: ActiveCategory;
  onChange: (cat: ActiveCategory) => void;
  signalCounts?: Partial<Record<ActiveCategory, number>>;
}

export function CategoryTabs({ active, onChange, signalCounts }: CategoryTabsProps) {
  const all: ActiveCategory[] = ["all", ...CATEGORIES];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {all.map(cat => {
        const isActive = cat === active;
        const signals = signalCounts?.[cat] ?? 0;
        const label = cat === "all" ? "All" : cat;

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              isActive ? "text-black font-semibold" : "hover:text-white"
            )}
            style={{
              backgroundColor: isActive ? "#00e6a0" : "rgba(255,255,255,0.04)",
              color: isActive ? "#000" : "#94a3b8",
              border: isActive ? "none" : "1px solid #1e2533",
            }}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            <span>{label}</span>
            {signals > 0 && !isActive && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono font-bold"
                style={{
                  backgroundColor: signals >= 2 ? "rgba(255,71,87,0.2)" : "rgba(255,197,66,0.15)",
                  color: signals >= 2 ? "#ff4757" : "#ffc542",
                }}
              >
                {signals}
              </span>
            )}
            {cat !== "all" && (
              <Link
                href={`/dashboard/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="ml-0.5 opacity-40 hover:opacity-100 transition-opacity text-xs"
                onClick={e => e.stopPropagation()}
                title={`Deep-dive into ${cat}`}
                style={{ color: isActive ? "#000" : "#94a3b8" }}
              >
                ↗
              </Link>
            )}
          </button>
        );
      })}
    </div>
  );
}
