import { NextResponse } from "next/server";
import searchIndex from "../../../../../data/search-index.json";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type IndexItem = {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  badge: string;
};

const items = (searchIndex as { items: IndexItem[] }).items ?? [];

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`search:${ip}`, 120, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") || 12), 24);

  if (!q) {
    const { getPopularSearches } = await import("@/lib/search-constants");
    return NextResponse.json({ suggestions: getPopularSearches().slice(0, 8) });
  }

  const scored = items
    .map((item) => {
      const hay = `${item.name} ${item.category} ${item.keywords.join(" ")} ${item.badge}`.toLowerCase();
      if (hay.includes(q)) return { item, score: 10 };
      const words = q.split(/\s+/).filter(Boolean);
      const hits = words.filter((w) => hay.includes(w)).length;
      return hits ? { item, score: hits } : null;
    })
    .filter(Boolean) as { item: IndexItem; score: number }[];

  scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "es"));

  const suggestions = [...new Set(scored.slice(0, limit).map((s) => s.item.name.split("—")[0].trim()))];

  return NextResponse.json({ suggestions });
}
