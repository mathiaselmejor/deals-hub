import { isNewOffer } from "./offer-enrichment";
import { isDirectPurchaseOffer } from "./offer-target";
import type { Product, ProductOffer } from "./types";

/** Subconjunto mínimo para calcular precio mostrado (cards, ficha, JSON-LD). */
export type PricingInput = Pick<Product, "offers" | "price"> &
  Partial<Pick<Product, "originalPrice" | "discount">>;

export function getNewOffersWithPrice(product: PricingInput): ProductOffer[] {
  return product.offers.filter((o) => isNewOffer(o) && o.price > 0);
}

/** Al menos una tienda con precio verificado en ficha (no estimado) alineado con el precio mostrado. */
export function hasVerifiedPricing(product: PricingInput): boolean {
  const display = getDisplayPrice(product);
  return getNewOffersWithPrice(product).some(
    (o) => o.priceEstimated === false && Math.abs(o.price - display) < 0.02,
  );
}

/** Precio principal mostrado en card, ficha y barra sticky — siempre el mismo. */
export function getDisplayPrice(product: PricingInput): number {
  const offers = getNewOffersWithPrice(product);
  if (offers.length) return Math.min(...offers.map((o) => o.price));
  return product.price > 0 ? product.price : 0;
}

/** Oferta que corresponde al precio mostrado (la más barata; empate → verificada > directa > Amazon). */
export function getPrimaryOffer(product: PricingInput): ProductOffer | undefined {
  const offers = getNewOffersWithPrice(product);
  if (!offers.length) return product.offers.find(isNewOffer);

  const target = getDisplayPrice(product);
  const candidates = offers.filter((o) => Math.abs(o.price - target) < 0.02);
  const pool = candidates.length ? candidates : offers;

  return [...pool].sort((a, b) => {
    const aV = a.priceEstimated === false ? 1 : 0;
    const bV = b.priceEstimated === false ? 1 : 0;
    if (bV !== aV) return bV - aV;
    const aD = isDirectPurchaseOffer(a) ? 1 : 0;
    const bD = isDirectPurchaseOffer(b) ? 1 : 0;
    if (bD !== aD) return bD - aD;
    if (a.store === "amazon" && b.store !== "amazon") return -1;
    if (b.store === "amazon" && a.store !== "amazon") return 1;
    return a.price - b.price;
  })[0];
}

export function getDisplayOriginalPrice(product: PricingInput): number {
  const price = getDisplayPrice(product);
  if (!hasVerifiedPricing(product)) return price;
  if ((product.originalPrice ?? 0) > price + 0.5) return product.originalPrice ?? price;
  return price;
}

export function getDisplayDiscount(product: PricingInput): number {
  if (!hasVerifiedPricing(product)) return 0;
  const price = getDisplayPrice(product);
  const orig = getDisplayOriginalPrice(product);
  if (orig <= price + 0.5) return 0;
  return Math.round((1 - price / orig) * 100);
}

export function getDisplaySavings(product: PricingInput): number {
  const price = getDisplayPrice(product);
  const orig = getDisplayOriginalPrice(product);
  if (!hasVerifiedPricing(product) || orig <= price) return 0;
  return Math.round((orig - price) * 100) / 100;
}

export function isOrientativePrice(product: PricingInput): boolean {
  return getDisplayPrice(product) > 0 && !hasVerifiedPricing(product);
}

/** Normaliza price / originalPrice / discount en el producto (runtime + scripts). */
export function applyConsistentProductPricing<T extends Product>(product: T): T {
  const offers = getNewOffersWithPrice(product);
  if (!offers.length) return product;

  const price = Math.min(...offers.map((o) => o.price));

  if (/^c[6-9]-/.test(product.id)) {
    return {
      ...product,
      price,
      originalPrice: price,
      discount: 0,
      listingKind: "catalog",
    };
  }

  const verified = hasVerifiedPricing({ ...product, price, offers: product.offers });

  let originalPrice = product.originalPrice;
  let discount = product.discount;

  if (!verified) {
    originalPrice = price;
    discount = 0;
  } else {
    if (originalPrice <= price + 0.5) {
      originalPrice = price;
      discount = 0;
    } else {
      discount = Math.round((1 - price / originalPrice) * 100);
    }
  }

  return {
    ...product,
    price,
    originalPrice,
    discount,
  };
}
