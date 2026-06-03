const KEY = "dh_recent_searches";
const MAX = 8;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as unknown;
    return Array.isArray(list)
      ? list.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  const q = query.trim();
  if (q.length < 2) return;
  const prev = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  const next = [q, ...prev].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
