"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SearchBar } from "@/components/SearchBar";
import { AuthButton } from "@/components/AuthButton";

const nav = [
  { href: "/", label: "Ofertas" },
  { href: "/comparar", label: "Comparar", highlight: true },
  { href: "/buscar", label: "Buscar" },
  { href: "/rankings", label: "Rankings" },
  { href: "/referidos", label: "Referidos" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" title="DealsHub España">
            <BrandMark size={36} className="shadow-lg shadow-indigo-500/25" aria-label="DealsHub" />
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              Deals<span className="text-indigo-400">Hub</span>
            </span>
          </Link>

          <div className="hidden flex-1 md:block lg:max-w-md xl:max-w-lg">
            <SearchBar placeholder="Buscar productos, marcas..." />
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active = pathname === item.href;
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                    }`}
                  >
                    ⚔️ {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <AuthButton />
            <Link href="/buscar" className="rounded-lg p-2 text-lg md:hidden" aria-label="Buscar">
              🔍
            </Link>
            <Link href="/comparar" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">
              Comparar
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
                className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
