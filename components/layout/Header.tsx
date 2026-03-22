"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletSearch } from "@/components/dashboard/WalletSearch";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/signals", label: "Signals" },
    { href: "/dashboard/watchlist", label: "Watchlist" },
    { href: "/dashboard/feed", label: "Feed" },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 border-b flex items-center px-4 md:px-6 gap-4 md:gap-6"
        style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2533" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
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
        <div className="hidden sm:flex items-center gap-1.5 text-xs shrink-0" style={{ color: "#94a3b8" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00e6a0" }} />
          <span className="font-mono">LIVE</span>
        </div>

        {/* Nav — desktop only */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname?.startsWith(link.href) ? "text-white" : "hover:text-white"
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

        {/* Search — hidden on mobile */}
        <div className="hidden md:block">
          <WalletSearch />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <LiveClock />
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ backgroundColor: "#00e6a0", color: "#000" }}
          >
            Launch App
          </Link>
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 transition-all"
              style={{
                backgroundColor: "#94a3b8",
                transform: mobileOpen ? "rotate(45deg) translate(3px, 3px)" : undefined,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all"
              style={{
                backgroundColor: "#94a3b8",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all"
              style={{
                backgroundColor: "#94a3b8",
                transform: mobileOpen ? "rotate(-45deg) translate(3px, -3px)" : undefined,
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          className="fixed top-14 left-0 right-0 z-40 border-b md:hidden"
          style={{ backgroundColor: "#0a0b0f", borderColor: "#1e2533" }}
        >
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  color: pathname?.startsWith(link.href) ? "#00e6a0" : "#94a3b8",
                  backgroundColor: pathname?.startsWith(link.href) ? "rgba(0,230,160,0.1)" : undefined,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-3">
            <WalletSearch />
          </div>
        </div>
      )}
    </>
  );
}

function LiveClock() {
  return (
    <span className="text-xs font-mono hidden md:block" style={{ color: "#475569" }}>
      {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}
