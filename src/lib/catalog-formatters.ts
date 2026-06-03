import affiliateConfig from "../../data/affiliate-config.json";
import { buildAffiliateUrl as buildAffiliateLink } from "./affiliate";
import { isNewOffer, isRefurbishedOffer } from "./offer-enrichment";
import { getDisplayPrice, getDisplaySavings, getPrimaryOffer, type PricingInput } from "./product-pricing";
import type { AffiliateConfig, ProductOffer } from "./types";

const config = affiliateConfig as AffiliateConfig;

export { getDisplayPrice } from "./product-pricing";

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

export function getLowestPrice(product: { offers: ProductOffer[]; price?: number }, refurbished = false): number {
  if (refurbished) {
    const prices = getRefurbishedOffers(product)
      .map((o) => o.price)
      .filter((p) => p > 0);
    return prices.length ? Math.min(...prices) : 0;
  }
  return getDisplayPrice(product as PricingInput);
}

export function getBestOffer(product: { offers: ProductOffer[]; price?: number; originalPrice?: number; discount?: number }): ProductOffer | undefined {
  return getPrimaryOffer(product as PricingInput);
}

export function getBestRefurbishedOffer(
  product: { offers: ProductOffer[] },
): ProductOffer | undefined {
  return getRefurbishedOffers(product).filter((o) => o.price > 0)[0];
}

export function getSavings(product: { price: number; originalPrice: number; offers?: ProductOffer[]; discount?: number }): number {
  return getDisplaySavings(product as PricingInput);
}
