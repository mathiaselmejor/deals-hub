import type { ProductOffer, StoreId } from "./types";
import { amazonProductUrl, extractAmazonAsin } from "./direct-links";

/** URL de destino final antes de envolver con afiliado (ficha producto, no búsqueda genérica). */
export function getOfferTargetUrl(offer: ProductOffer): string {
  if (offer.store === "amazon") {
    const asin = offer.asin ?? extractAmazonAsin(offer.url) ?? extractAmazonAsin(offer.directUrl ?? "");
    if (asin) return amazonProductUrl(asin);
  }

  if (offer.linkKind === "direct") {
    return offer.directUrl || offer.url;
  }

  return offer.url;
}

export function isDirectPurchaseOffer(offer: ProductOffer): boolean {
  if (offer.linkKind === "direct") return true;
  if (offer.store === "amazon") {
    const asin = offer.asin ?? extractAmazonAsin(offer.url);
    return !!asin;
  }
  if (offer.store === "aliexpress") {
    return /\/item\/\d+/i.test(offer.url ?? "") || /\/item\/\d+/i.test(offer.directUrl ?? "");
  }
  return false;
}

export function appendInternalTracking(url: string, productId: string, store: StoreId): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "dealshub");
    u.searchParams.set("utm_medium", "affiliate");
    u.searchParams.set("utm_campaign", productId);
    u.searchParams.set("utm_content", store);
    return u.toString();
  } catch {
    return url;
  }
}
