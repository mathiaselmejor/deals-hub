"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";

const nav = [
  { href: "/", label: "Ofertas", icon: "🔥" },
  { href: "/buscar", label: "Buscar", icon: "🔍" },
  { href: "/rankings", label: "Rankings", icon: "🏆" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg shadow-lg shadow-indigo-500/25">
              🔥
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              Deals<span className="text-indigo-400">Hub</span>
            </span>
          </Link>

          <div className="hidden flex-1 md:block lg:max-w-md xl:max-w-lg">
            <SearchBar placeholder="Buscar ofertas..." />
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/buscar"
              className="rounded-lg p-2 text-lg md:hidden"
              aria-label="Buscar"
            >
              🔍
            </Link>
            <Link
              href="/buscar"
              className="hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition hover:opacity-90 sm:inline-block"
            >
              Buscar ofertas
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
              aria-label="Menú"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mt-3 border-t border-white/5 pt-3 lg:hidden">
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
      </div>
    </header>
  );
}
