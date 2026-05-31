import affiliateConfig from "../../data/affiliate-config.json";
import productsData from "../../data/products.json";
import extraProductsData from "../../data/extra-products.json";
import extraProducts2Data from "../../data/extra-products-2.json";
import topListsData from "../../data/top-lists.json";
import type { AffiliateConfig, Category, Product, ProductsData, ProductOffer, SortOption, TopList } from "./types";

const config = affiliateConfig as AffiliateConfig;
const topLists = topListsData.lists as TopList[];

function mergeCatalog(): ProductsData {
  const base = productsData as ProductsData;
  const extra = extraProductsData as { products: Product[]; categories: Category[]; lastUpdated?: string };
  const extra2 = extraProducts2Data as { products: Product[] };
  const categoryMap = new Map<string, Category>();
  for (const c of base.categories) categoryMap.set(c.id, c);
  for (const c of extra.categories) categoryMap.set(c.id, c);

  return {
    lastUpdated: extra.lastUpdated ?? base.lastUpdated,
    products: [...base.products, ...extra.products, ...extra2.products],
    categories: Array.from(categoryMap.values()),
  };
}

const catalog = mergeCatalog();

export function getCatalog(): ProductsData {
  return catalog;
}

export function getAffiliateConfig(): AffiliateConfig {
  return config;
}

export function getTopLists(): TopList[] {
  return topLists;
}

export function getTopListBySlug(slug: string): TopList | undefined {
  return topLists.find((l) => l.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return catalog.products.find((p) => p.id === id);
}

export function getTrendingProducts(): Product[] {
  return catalog.products.filter((p) => p.trending);
}

export function getFeaturedProducts(): Product[] {
  return catalog.products.filter((p) => p.featured);
}

export function getDealOfDay(): Product | undefined {
  return catalog.products.find((p) => p.dealOfDay) ?? catalog.products[0];
}

export function getProductsByCategory(categoryId: string): Product[] {
  if (categoryId === "all") return catalog.products;
  return catalog.products.filter((p) => p.category === categoryId);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return catalog.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return catalog.products;

  const terms = q.split(/\s+/).filter(Boolean);

  return catalog.products.filter((p) => {
    const categoryLabel = getCategoryLabel(p.category).toLowerCase();
    const haystack = [
      p.name,
      p.description,
      p.longDescription ?? "",
      p.badge,
      categoryLabel,
      ...p.keywords,
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}

export function getSearchSuggestions(query: string, limit = 6): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return getPopularSearches();

  const suggestions = new Set<string>();

  for (const p of catalog.products) {
    if (p.name.toLowerCase().includes(q)) suggestions.add(p.name);
    for (const kw of p.keywords) {
      if (kw.toLowerCase().includes(q)) suggestions.add(kw);
    }
  }

  for (const cat of catalog.categories) {
    if (cat.id !== "all" && cat.label.toLowerCase().includes(q)) {
      suggestions.add(cat.label);
    }
  }

  return [...suggestions].slice(0, limit);
}

export function getCategoryById(id: string): Category | undefined {
  return catalog.categories.find((c) => c.id === id);
}

export function getCategoriesWithCounts(): (Category & { count: number })[] {
  return catalog.categories
    .filter((c) => c.id !== "all")
    .map((c) => ({
      ...c,
      count: catalog.products.filter((p) => p.category === c.id).length,
    }))
    .sort((a, b) => b.count - a.count);
}

export const POPULAR_SEARCHES = [
  "zapatillas nike",
  "sudadera",
  "air fryer",
  "iphone",
  "ps5",
  "lego",
  "padel",
  "mascotas",
  "nespresso",
  "televisor",
  "deportes",
  "ropa",
  "gaming",
  "bebe",
  "coche",
  "proteina",
  "samsung",
  "north face",
  "adidas samba",
  "cafetera",
];

export function getPopularSearches(): string[] {
  return POPULAR_SEARCHES;
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case "discount":
      return copy.sort((a, b) => b.discount - a.discount);
    case "price-asc":
      return copy.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    case "price-desc":
      return copy.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "reviews":
      return copy.sort((a, b) => b.reviews - a.reviews);
    default:
      return copy;
  }
}

export function getSavings(product: Product): number {
  return Math.max(0, product.originalPrice - product.price);
}

export function getMaxDiscount(): number {
  return Math.max(...catalog.products.map((p) => p.discount), 0);
}

export function buildAffiliateUrl(offer: ProductOffer): string {
  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG;
  const awinId = process.env.NEXT_PUBLIC_AWIN_PUBLISHER_ID;

  if (offer.store === "amazon" && amazonTag) {
    const url = new URL(offer.url);
    url.searchParams.set("tag", amazonTag);
    return url.toString();
  }

  if (
    awinId &&
    ["pccomponentes", "mediamarkt", "elcorteingles", "fnac", "decathlon", "ikea"].includes(
      offer.store
    )
  ) {
    return `https://www.awin1.com/cread.php?awinmid=0&awinaffid=${awinId}&ued=${encodeURIComponent(offer.url)}`;
  }

  return offer.url;
}

export function formatPrice(price: number): string {
  if (price === 0) return "Ver oferta";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function formatReviews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("es-ES");
}

export function getLowestPrice(product: { offers: ProductOffer[] }): number {
  const prices = product.offers.map((o) => o.price).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : 0;
}

export function getBestOffer(product: { offers: ProductOffer[] }): ProductOffer | undefined {
  return product.offers.filter((o) => o.price > 0).sort((a, b) => a.price - b.price)[0];
}

export function getCategoryLabel(categoryId: string): string {
  return catalog.categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}
