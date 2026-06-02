import { amazonProductUrl, extractAmazonAsin } from "./direct-links";
import type { Product, ProductOffer } from "./types";

const REFURB_STORES: ProductOffer["store"][] = ["amazon", "ebay"];

function searchTerm(product: Product): string {
  return product.name.split("—")[0].trim();
}

function refurbishedAmazonUrl(product: Product, asin?: string): string {
  const fromOffer = product.offers
    .map((o) => o.asin ?? extractAmazonAsin(o.url))
    .find(Boolean);
  const id = asin ?? fromOffer;
  if (id) return `${amazonProductUrl(id)}?aod=1`;
  const q = `${searchTerm(product)} amazon renewed reacondicionado`;
  return `https://www.amazon.es/s?k=${encodeURIComponent(q)}`;
}

function refurbishedEbayUrl(term: string): string {
  return `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(term)}&LH_ItemCondition=2000|2010`;
}

function estimatedRefurbPrice(basePrice: number, store: ProductOffer["store"]): number {
  if (basePrice <= 0) return 0;
  const factor = store === "amazon" ? 0.84 : 0.78;
  return Math.round(basePrice * factor * 100) / 100;
}

function hasRefurbished(offers: ProductOffer[], store: ProductOffer["store"]): boolean {
  return offers.some((o) => o.store === store && o.condition === "refurbished");
}

export function appendRefurbishedOffers(product: Product): ProductOffer[] {
  const offers = [...product.offers];
  const term = searchTerm(product);
  const newPrices = offers
    .filter((o) => o.condition !== "refurbished" && o.price > 0)
    .map((o) => o.price);
  const basePrice = newPrices.length ? Math.min(...newPrices) : product.price;
  const mainAsin =
    offers
      .filter((o) => o.condition !== "refurbished" && o.store === "amazon")
      .map((o) => o.asin ?? extractAmazonAsin(o.url))[0] ?? undefined;

  for (const store of REFURB_STORES) {
    if (hasRefurbished(offers, store)) continue;
    const price = estimatedRefurbPrice(basePrice, store);
    if (price <= 0) continue;

    if (store === "amazon") {
      const url = refurbishedAmazonUrl(product, mainAsin);
      offers.push({
        store,
        url,
        directUrl: url,
        asin: mainAsin,
        price,
        condition: "refurbished",
        linkKind: mainAsin ? "direct" : "search",
        priceEstimated: !mainAsin,
        note: mainAsin ? "Amazon Renewed — misma ficha" : "Buscar reacondicionado",
      });
    } else {
      offers.push({
        store,
        url: refurbishedEbayUrl(term),
        price,
        condition: "refurbished",
        linkKind: "search",
        priceEstimated: true,
        note: "eBay — renovado o certificado",
      });
    }
  }

  return offers;
}

export function enrichProduct(product: Product): Product {
  return {
    ...product,
    offers: appendRefurbishedOffers(product),
  };
}

export function enrichCatalogProducts(products: Product[]): Product[] {
  return products.map(enrichProduct);
}

export function isNewOffer(offer: ProductOffer): boolean {
  return offer.condition !== "refurbished";
}

export function isRefurbishedOffer(offer: ProductOffer): boolean {
  return offer.condition === "refurbished";
}
