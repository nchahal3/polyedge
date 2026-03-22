"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletSearch } from "@/components/dashboard/WalletSearch";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/signals", label: "Signals" },
    { href: "/dashboard/watchlist", label: "Watchlist" },
    { href: "/dashboard/feed", label: "Feed" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 border-b flex items-center px-6 gap-6"
      style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2533" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-4">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #00e6a0, #4ecdc4)" }}
        >
          <span className="text-black font-bold text-sm font-mono">P</span>
        </div>
        <span className="font-bold text-base tracking-tight" style={{ color: "#e2e8f0" }}>
          Poly<span style={{ color: "#00e6a0" }}>Edge</span>
        </span>
      </Link>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: "#00e6a0" }}
        />
        <span className="font-mono">LIVE</span>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1 ml-2">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              pathname?.startsWith(link.href)
                ? "text-white"
                : "hover:text-white"
            )}
            style={{
              color: pathname?.startsWith(link.href) ? "#00e6a0" : "#94a3b8",
              backgroundColor: pathname?.startsWith(link.href) ? "rgba(0,230,160,0.1)" : undefined,
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Search */}
      <WalletSearch />

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <LiveClock />
        <Link
          href="/dashboard"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ backgroundColor: "#00e6a0", color: "#000" }}
        >
          Launch App
        </Link>
      </div>
    </header>
  );
}

function LiveClock() {
  // Static render to avoid hydration mismatch; real-time clock is a nice-to-have
  return (
    <span className="text-xs font-mono hidden md:block" style={{ color: "#475569" }}>
      {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}
