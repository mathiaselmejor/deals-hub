import aliexpressLinksData from "../../data/aliexpress-links.json";
import type { LinkKind } from "./direct-links";
import type { Product, ProductOffer } from "./types";

type AliExpressLinkEntry = {
  url: string;
  itemId?: string;
  imageUrl?: string;
  linkKind?: LinkKind;
  note?: string;
};

const raw = aliexpressLinksData as Record<string, AliExpressLinkEntry | string>;
const linkMap: Record<string, AliExpressLinkEntry> = {};
for (const [key, val] of Object.entries(raw)) {
  if (key === "_comment" || typeof val === "string") continue;
  linkMap[key] = val;
}

export function aliexpressItemUrl(itemId: string): string {
  const clean = itemId.replace(/\D/g, "");
  return `https://es.aliexpress.com/item/${clean}.html`;
}

export function isAliExpressItemUrl(url: string): boolean {
  return /aliexpress\.(com|us|ru)\/item\/\d+/i.test(url);
}

export function isAliExpressDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.includes("aliexpress.com") || host.includes("aliexpress.us");
  } catch {
    return false;
  }
}

export function inferAliExpressLinkKind(url: string): LinkKind {
  return isAliExpressItemUrl(url) ? "direct" : "search";
}

export function getAliExpressLinkEntry(productId: string): AliExpressLinkEntry | undefined {
  return linkMap[productId];
}

export function resolveAliExpressOffer(
  offer: ProductOffer,
  productId: string,
): ProductOffer {
  if (offer.store !== "aliexpress") return offer;

  const entry = linkMap[productId];
  const url =
    entry?.itemId
      ? aliexpressItemUrl(entry.itemId)
      : entry?.url ?? offer.directUrl ?? offer.url;

  const linkKind = entry?.linkKind ?? inferAliExpressLinkKind(url);

  return {
    ...offer,
    url,
    directUrl: linkKind === "direct" ? url : offer.directUrl ?? url,
    linkKind,
    priceEstimated: linkKind === "search",
    note: entry?.note ?? offer.note ?? "Comisión AliExpress Portals activa",
  };
}

export function applyAliExpressLinks(product: Product): Product {
  const entry = linkMap[product.id];
  const offers = product.offers.map((o) => resolveAliExpressOffer(o, product.id));
  const image = entry?.imageUrl ? entry.imageUrl : product.image;

  return { ...product, offers, image };
}

export function getAliExpressLinkMapSize(): number {
  return Object.keys(linkMap).length;
}

export function isAliExpressProduct(product: Product): boolean {
  return product.offers.some((o) => o.store === "aliexpress");
}

export function filterAliExpressCatalog(products: Product[]): Product[] {
  return products.filter(
    (p) => p.id.startsWith("aliexpress-") || p.offers.some((o) => o.store === "aliexpress"),
  );
}
