import catalogLiveData from "../../data/catalog-live.json";
import directAsinsData from "../../data/direct-asins.json";
import rotationData from "../../data/rotation-state.json";
import { normalizeProductOffers } from "./direct-links";
import { enrichProduct } from "./offer-enrichment";
import type { Product, ProductOffer } from "./types";

type AsinMap = Record<string, string | { amazon?: string; directUrl?: string }>;

const asinMap: AsinMap = { ...(directAsinsData as AsinMap) };
delete (asinMap as { _comment?: string })._comment;

type LiveCatalog = {
  updatedAt?: string;
  products?: Record<
    string,
    {
      price?: number;
      originalPrice?: number;
      discount?: number;
      offers?: Record<string, Partial<ProductOffer>>;
    }
  >;
};

type RotationState = {
  trendingIds?: string[];
  featuredIds?: string[];
  dealOfDayId?: string | null;
};

function applyLiveOverlay(product: Product): Product {
  const live = (catalogLiveData as LiveCatalog).products?.[product.id];
  if (!live) return product;

  let offers = [...product.offers];
  if (live.offers) {
    offers = offers.map((o) => {
      const patch = live.offers?.[o.store];
      if (!patch) return o;
      return {
        ...o,
        ...patch,
        url: patch.url ?? o.url,
        price: patch.price ?? o.price,
        priceEstimated: patch.priceEstimated ?? false,
        linkKind: patch.linkKind ?? o.linkKind,
      };
    });
  }

  const price = live.price ?? product.price;
  const originalPrice = live.originalPrice ?? product.originalPrice;
  const discount = live.discount ?? product.discount;

  return {
    ...product,
    offers,
    price,
    originalPrice,
    discount,
    priceUpdatedAt: (catalogLiveData as LiveCatalog).updatedAt ?? product.priceUpdatedAt,
  };
}

function applyRotationFlags(product: Product): Product {
  const rot = rotationData as RotationState;
  if (!rot.trendingIds?.length) return product;
  return {
    ...product,
    trending: rot.trendingIds?.includes(product.id) ?? product.trending,
    featured: rot.featuredIds?.includes(product.id) ?? product.featured,
    dealOfDay: product.id === rot.dealOfDayId,
  };
}

export function finalizeCatalogProduct(product: Product): Product {
  const enriched = enrichProduct(product);
  const normalized = normalizeProductOffers(enriched, asinMap);
  const withLive = applyLiveOverlay(normalized);
  return applyRotationFlags(withLive);
}

export function getCatalogLiveUpdatedAt(): string | undefined {
  return (catalogLiveData as LiveCatalog).updatedAt;
}

export function getRotationDayKey(): string | undefined {
  return (rotationData as { dayKey?: string }).dayKey;
}
