"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageSearchPanel } from "@/components/ImageSearchPanel";
import { getPopularSearches } from "@/lib/search-constants";
import { getRecentSearches, pushRecentSearch } from "@/lib/recent-searches";
import { trackEvent } from "@/components/AnalyticsTracker";

interface SearchBarProps {
  defaultValue?: string;
  size?: "default" | "large";
  autoFocus?: boolean;
  placeholder?: string;
  showImageSearch?: boolean;
}

export function SearchBar({
  defaultValue = "",
  size = "default",
  autoFocus = false,
  placeholder = "Buscar ofertas: zapatillas, nike, sudadera, air fryer...",
  showImageSearch = true,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
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
    if (!value.trim()) {
      setRecent(getRecentSearches());
      setSuggestions(getPopularSearches());
      return;
    }
    const ac = new AbortController();
    fetch(`/api/search/suggest?q=${encodeURIComponent(value)}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions ?? []))
      .catch(() => setSuggestions([]));
    return () => ac.abort();
  }, []);

  const goSearch = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    pushRecentSearch(q);
    setRecent(getRecentSearches());
    trackEvent("search", { query: q });
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  };

  const isLarge = size === "large";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={showImageSearch ? "flex gap-2" : undefined}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goSearch(query);
          }}
          className="relative min-w-0 flex-1"
        >
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLarge ? "text-lg" : "text-sm"} text-slate-500`}
        >
          🔍
        </span>
        <input
          type="search"
          data-search-main
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
            isLarge
              ? `py-4 pl-12 ${showImageSearch ? "pr-28" : "pr-28"} text-base`
              : `py-2.5 pl-10 ${showImageSearch ? "pr-20" : "pr-20"} text-sm`
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
        {showImageSearch && <ImageSearchPanel variant="compact" />}
      </div>

      {open && (suggestions.length > 0 || (!query.trim() && recent.length > 0)) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl">
          {!query.trim() && recent.length > 0 && (
            <>
              <p className="border-b border-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Recientes
              </p>
              <ul>
                {recent.map((s) => (
                  <li key={`r-${s}`}>
                    <button
                      type="button"
                      onClick={() => goSearch(s)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <span className="text-slate-500">🕐</span>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {suggestions.length > 0 && (
            <>
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
            </>
          )}
          {!query.trim() && (
            <p className="border-t border-white/5 px-4 py-2 text-[10px] text-slate-600">
              Atajo: pulsa <kbd className="rounded bg-white/10 px-1">/</kbd> para buscar
            </p>
          )}
        </div>
      )}
    </div>
  );
}
