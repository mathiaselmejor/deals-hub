import type { Product, ProductOffer, StoreId } from "./types";

export type LinkKind = "direct" | "search";

export function extractAmazonAsin(url: string): string | null {
  const m =
    url.match(/\/dp\/([A-Z0-9]{10})/i) ||
    url.match(/\/gp\/product\/([A-Z0-9]{10})/i) ||
    url.match(/[?&]asin=([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

export function amazonProductUrl(asin: string): string {
  const clean = asin.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `https://www.amazon.es/dp/${clean}`;
}

export function isSearchListingUrl(url: string, store: StoreId): boolean {
  try {
    const u = new URL(url);
    if (store === "amazon") {
      return u.pathname.includes("/s") || (u.pathname === "/" && u.search.includes("k="));
    }
    if (store === "pccomponentes") return u.pathname.includes("/search");
    if (store === "mediamarkt") return u.pathname.includes("/search");
    if (store === "fnac") return u.pathname.includes("SearchResult");
    if (store === "elcorteingles") return u.pathname.includes("/search");
    if (store === "decathlon") return u.pathname.includes("/search");
    if (store === "ebay") return u.pathname.includes("/sch/");
    if (store === "ikea") return u.pathname.includes("/search");
  } catch {
    return true;
  }
  return !url.includes("/dp/") && !url.includes("/product") && !url.includes("/itm/");
}

function searchQueryFromProduct(product: Product): string {
  return product.name.split("—")[0].trim();
}

export function resolveOfferUrl(
  offer: ProductOffer,
  product: Product,
  asinMap?: Record<string, string | { amazon?: string; directUrl?: string }>,
): ProductOffer {
  const search = searchQueryFromProduct(product);
  const mapEntry = asinMap?.[product.id];
  const mappedAsin =
    typeof mapEntry === "string"
      ? mapEntry
      : typeof mapEntry === "object"
        ? mapEntry.amazon
        : undefined;
  const mappedDirect =
    typeof mapEntry === "object" && mapEntry?.directUrl ? mapEntry.directUrl : undefined;

  let asin = offer.asin ?? mappedAsin ?? extractAmazonAsin(offer.url);
  let url = offer.directUrl ?? offer.url;
  let linkKind: LinkKind = offer.linkKind ?? "search";

  if (offer.condition === "refurbished" && offer.store === "amazon" && asin) {
    url = `${amazonProductUrl(asin)}?aod=1`;
    linkKind = "direct";
  } else if (offer.store === "amazon") {
    if (asin) {
      url = amazonProductUrl(asin);
      linkKind = "direct";
    } else if (mappedDirect) {
      url = mappedDirect;
      linkKind = "direct";
    }
  } else if (mappedDirect) {
    url = mappedDirect;
    linkKind = "direct";
  } else if (offer.directUrl) {
    url = offer.directUrl;
    linkKind = isSearchListingUrl(url, offer.store) ? "search" : "direct";
  } else if (!isSearchListingUrl(url, offer.store)) {
    linkKind = "direct";
  }

  return {
    ...offer,
    asin: asin ?? offer.asin,
    url,
    directUrl: linkKind === "direct" ? url : offer.directUrl,
    linkKind,
    priceEstimated: offer.priceEstimated ?? linkKind === "search",
    lastChecked: offer.lastChecked,
  };
}

export function normalizeProductOffers(
  product: Product,
  asinMap?: Record<string, string | { amazon?: string; directUrl?: string }>,
): Product {
  const offers = product.offers.map((o) => resolveOfferUrl(o, product, asinMap));
  const newOffers = offers.filter((o) => o.condition !== "refurbished");
  const prices = newOffers.filter((o) => o.price > 0).map((o) => o.price);
  const best = prices.length ? Math.min(...prices) : product.price;
  const orig =
    product.originalPrice > best ? product.originalPrice : best * 1.15;
  const discount =
    orig > best ? Math.round((1 - best / orig) * 100) : product.discount;

  return {
    ...product,
    offers,
    price: best,
    originalPrice: Math.round(orig * 100) / 100,
    discount,
    priceUpdatedAt: product.priceUpdatedAt,
  };
}
