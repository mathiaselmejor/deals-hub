"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPopularSearches, getSearchSuggestions } from "@/lib/products";
import { trackEvent } from "@/components/AnalyticsTracker";

interface SearchBarProps {
  defaultValue?: string;
  size?: "default" | "large";
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBar({
  defaultValue = "",
  size = "default",
  autoFocus = false,
  placeholder = "Buscar ofertas: zapatillas, nike, sudadera, air fryer...",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateSuggestions = useCallback((value: string) => {
    setSuggestions(value.trim() ? getSearchSuggestions(value) : getPopularSearches());
  }, []);

  const goSearch = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    trackEvent("search", { query: q });
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  };

  const isLarge = size === "large";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearch(query);
        }}
        className="relative"
      >
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLarge ? "text-lg" : "text-sm"} text-slate-500`}
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            updateSuggestions(e.target.value);
          }}
          onFocus={() => {
            updateSuggestions(query);
            setOpen(true);
          }}
          className={`w-full rounded-xl border border-white/10 bg-card text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            isLarge ? "py-4 pl-12 pr-28 text-base" : "py-2.5 pl-10 pr-20 text-sm"
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white transition hover:opacity-90 ${
            isLarge ? "px-5 py-2 text-sm" : "px-3 py-1.5 text-xs"
          }`}
        >
          Buscar
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl">
          <p className="border-b border-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {query.trim() ? "Sugerencias" : "Búsquedas populares"}
          </p>
          <ul>
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => goSearch(s)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <span className="text-slate-500">{query.trim() ? "→" : "🔥"}</span>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
