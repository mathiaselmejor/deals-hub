import affiliateConfig from "../../data/affiliate-config.json";
import productsData from "../../data/products.json";
import extraProductsData from "../../data/extra-products.json";
import extraProducts2Data from "../../data/extra-products-2.json";
import extraProducts3Data from "../../data/extra-products-3.json";
import extraProducts4Data from "../../data/extra-products-4.json";
import catalogMonetizedData from "../../data/catalog-monetized.json";
import topListsData from "../../data/top-lists.json";
import { getRelatedProductsSmart } from "./algorithms";
import { buildAffiliateUrl as buildAffiliateLink } from "./affiliate";
import { finalizeCatalogProduct, getCatalogLiveUpdatedAt } from "./catalog-pipeline";
import { isNewOffer, isRefurbishedOffer } from "./offer-enrichment";
import type { AffiliateConfig, Category, Product, ProductsData, ProductOffer, SortOption, TopList } from "./types";

const config = affiliateConfig as AffiliateConfig;
const topLists = topListsData.lists as TopList[];

function mergeCatalog(): ProductsData {
  const base = productsData as ProductsData;
  const extra = extraProductsData as { products: Product[]; categories: Category[]; lastUpdated?: string };
  const extra2 = extraProducts2Data as { products: Product[] };
  const extra3 = extraProducts3Data as {
    products: Product[];
    categories: Category[];
    lastUpdated?: string;
  };
  const extra4 = extraProducts4Data as {
    products: Product[];
    categories: Category[];
    lastUpdated?: string;
  };
  const monetized = catalogMonetizedData as {
    products: Product[];
    categories?: Category[];
    lastUpdated?: string;
  };
  const categoryMap = new Map<string, Category>();
  for (const c of base.categories) categoryMap.set(c.id, c);
  for (const c of extra.categories) categoryMap.set(c.id, c);
  for (const c of extra3.categories) categoryMap.set(c.id, c);
  for (const c of extra4.categories) categoryMap.set(c.id, c);
  for (const c of monetized.categories ?? []) categoryMap.set(c.id, c);

  /** Prioridad: base → extra → extra2 → extra3 → extra4 → monetized (último gana en duplicados) */
  const byId = new Map<string, Product>();
  const layers = [
    ...monetized.products,
    ...extra4.products,
    ...extra3.products,
    ...extra2.products,
    ...extra.products,
    ...base.products,
  ];
  for (const p of layers) {
    byId.set(p.id, p);
  }

  const liveAt = getCatalogLiveUpdatedAt();

  return {
    lastUpdated: liveAt?.slice(0, 10) ?? monetized.lastUpdated ?? extra4.lastUpdated ?? extra3.lastUpdated ?? extra.lastUpdated ?? base.lastUpdated,
    products: Array.from(byId.values()).map(finalizeCatalogProduct),
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

export function isDealListing(product: Product): boolean {
  if (product.listingKind === "catalog") return false;
  if (product.listingKind === "deal") return true;
  return (
    product.discount >= 10 ||
    product.trending ||
    product.featured ||
    product.dealOfDay === true
  );
}

export function getDealProducts(): Product[] {
  return catalog.products.filter(isDealListing);
}

export function getCatalogListingProducts(): Product[] {
  return catalog.products.filter((p) => p.listingKind === "catalog");
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
  return getRelatedProductsSmart(product, limit);
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
  "iphone 15",
  "samsung galaxy",
  "air fryer",
  "ps5",
  "macbook",
  "robot aspirador",
  "patinete electrico",
  "zapatillas nike",
  "lego technic",
  "oled tv",
  "rtx 4060",
  "kindle",
  "nespresso",
  "garmin",
  "padel",
  "crocs",
  "dyson",
  "colchon",
  "gaming",
  "smartwatch",
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

export function buildAffiliateUrl(offer: ProductOffer, productId?: string): string {
  return buildAffiliateLink(offer, productId);
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

export function getNewOffers(product: { offers: ProductOffer[] }): ProductOffer[] {
  return product.offers.filter(isNewOffer);
}

export function getRefurbishedOffers(product: { offers: ProductOffer[] }): ProductOffer[] {
  return product.offers.filter(isRefurbishedOffer).sort((a, b) => a.price - b.price);
}

export function getLowestPrice(product: { offers: ProductOffer[] }, refurbished = false): number {
  const pool = refurbished
    ? product.offers.filter(isRefurbishedOffer)
    : product.offers.filter(isNewOffer);
  const prices = pool.map((o) => o.price).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : 0;
}

/** Mejor precio en producto nuevo (principal). */
export function getBestOffer(product: { offers: ProductOffer[] }): ProductOffer | undefined {
  const candidates = getNewOffers(product).filter((o) => o.price > 0);
  if (!candidates.length) return undefined;
  return candidates.sort((a, b) => {
    const priceDiff = a.price - b.price;
    if (Math.abs(priceDiff) > 0.5) return priceDiff;
    if (a.linkKind === "direct" && b.linkKind !== "direct") return -1;
    if (b.linkKind === "direct" && a.linkKind !== "direct") return 1;
    return priceDiff;
  })[0];
}

export function getBestRefurbishedOffer(
  product: { offers: ProductOffer[] },
): ProductOffer | undefined {
  return getRefurbishedOffers(product).filter((o) => o.price > 0)[0];
}

export function getCategoryLabel(categoryId: string): string {
  return catalog.categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}
