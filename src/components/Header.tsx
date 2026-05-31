"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Ofertas", icon: "🔥" },
  { href: "/rankings", label: "Rankings", icon: "🏆" },
  { href: "/guia-afiliados", label: "Guía", icon: "💰" },
  { href: "/videos", label: "Vídeos", icon: "🎬" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg shadow-lg shadow-indigo-500/25">
            🔥
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">
              Deals<span className="text-indigo-400">Hub</span>
            </span>
            <span className="ml-2 hidden rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 sm:inline">
              ES
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#ofertas"
            className="hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition hover:opacity-90 sm:inline-block"
          >
            Ver chollos
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 md:hidden"
            aria-label="Menú"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/5 px-4 py-3 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
