import affiliateConfig from "../../data/affiliate-config.json";
import productsData from "../../data/products.json";
import topListsData from "../../data/top-lists.json";
import type { AffiliateConfig, Product, ProductsData, ProductOffer, SortOption, TopList } from "./types";

const config = affiliateConfig as AffiliateConfig;
const catalog = productsData as ProductsData;
const topLists = topListsData.lists as TopList[];

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
  return catalog.products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q)) ||
      p.badge.toLowerCase().includes(q)
  );
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
