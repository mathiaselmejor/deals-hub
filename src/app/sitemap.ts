import type { MetadataRoute } from "next";
import { getCatalog, getTopLists } from "@/lib/products";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = getCatalog();
  const lists = getTopLists();
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://deals-hub-iota.vercel.app";

  return [
    { url: base, lastModified: catalog.lastUpdated, changeFrequency: "daily", priority: 1 },
    { url: `${base}/buscar`, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/comparar`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/referidos`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/aviso-legal`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/rankings`, changeFrequency: "weekly", priority: 0.8 },
    ...catalog.products.map((p) => ({
      url: `${base}/producto/${p.id}`,
      lastModified: catalog.lastUpdated,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...catalog.categories
      .filter((c) => c.id !== "all")
      .map((c) => ({
        url: `${base}/categoria/${c.id}`,
        changeFrequency: "daily" as const,
        priority: 0.85,
      })),
    ...lists.map((l) => ({
      url: `${base}/rankings/${l.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
