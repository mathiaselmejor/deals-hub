import affiliateConfig from "../../data/affiliate-config.json";
import { buildAffiliateUrl as buildAffiliateLink } from "./affiliate";
import { isNewOffer, isRefurbishedOffer } from "./offer-enrichment";
import { isDirectPurchaseOffer } from "./offer-target";
import type { AffiliateConfig, ProductOffer } from "./types";

const config = affiliateConfig as AffiliateConfig;

export function getAffiliateConfig(): AffiliateConfig {
  return config;
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

export function getBestOffer(product: { offers: ProductOffer[] }): ProductOffer | undefined {
  const newOffers = getNewOffers(product);
  const direct = newOffers.filter((o) => o.price > 0 && isDirectPurchaseOffer(o));
  const pool = direct.length ? direct : newOffers.filter((o) => o.price > 0);
  if (!pool.length) return newOffers[0];
  return pool.sort((a, b) => {
    const priceDiff = a.price - b.price;
    if (Math.abs(priceDiff) > 0.5) return priceDiff;
    if (a.store === "amazon" && b.store !== "amazon") return -1;
    if (b.store === "amazon" && a.store !== "amazon") return 1;
    return priceDiff;
  })[0];
}

export function getBestRefurbishedOffer(
  product: { offers: ProductOffer[] },
): ProductOffer | undefined {
  return getRefurbishedOffers(product).filter((o) => o.price > 0)[0];
}

export function getSavings(product: { price: number; originalPrice: number }): number {
  return Math.max(0, product.originalPrice - product.price);
}
