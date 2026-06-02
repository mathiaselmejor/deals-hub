import type { Product } from "./types";
import { getCatalog, getLowestPrice, getSavings } from "./products";

export type UserSignal = {
  productId?: string;
  signalType: "view" | "click" | "search" | "favorite";
  payload?: { query?: string; category?: string };
};

/** Puntuación 0–100: combina descuento, reviews, rating y señales editoriales */
export function computeDealScore(product: Product): number {
  const price = getLowestPrice(product) || product.price;
  const savingsPct = price > 0 ? (getSavings(product) / price) * 100 : 0;

  const discountScore = Math.min(product.discount, 60) / 60;
  const ratingScore = product.rating / 5;
  const reviewScore = Math.min(product.reviews / 5000, 1);
  const savingsScore = Math.min(savingsPct / 40, 1);

  let editorial = 0;
  if (product.trending) editorial += 0.12;
  if (product.featured) editorial += 0.08;
  if (product.dealOfDay) editorial += 0.15;

  const raw =
    discountScore * 0.32 +
    ratingScore * 0.18 +
    reviewScore * 0.12 +
    savingsScore * 0.18 +
    editorial;

  return Math.round(Math.min(raw, 1) * 100);
}

export function getDealScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Chollo top", color: "text-emerald-400" };
  if (score >= 70) return { label: "Muy buena oferta", color: "text-indigo-400" };
  if (score >= 55) return { label: "Buen precio", color: "text-amber-400" };
  return { label: "Precio OK", color: "text-slate-400" };
}

export function rankProductsByDealScore(products: Product[]): Product[] {
  return [...products].sort((a, b) => computeDealScore(b) - computeDealScore(a));
}

export function getAlgorithmicTrending(limit = 12): Product[] {
  const { products } = getCatalog();
  return rankProductsByDealScore(
    products.filter((p) => p.trending || p.featured || p.dealOfDay || p.discount >= 15)
  ).slice(0, limit);
}

export function getBestDealsToday(limit = 8): Product[] {
  const { products } = getCatalog();
  return rankProductsByDealScore(products.filter((p) => p.discount >= 10)).slice(0, limit);
}

export function getRelatedProductsSmart(product: Product, limit = 4): Product[] {
  const { products } = getCatalog();
  const keywords = new Set(product.keywords.map((k) => k.toLowerCase()));

  return products
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let score = 0;
      if (p.category === product.category) score += 40;
      const overlap = p.keywords.filter((k) => keywords.has(k.toLowerCase())).length;
      score += overlap * 12;
      const priceA = getLowestPrice(product) || product.price;
      const priceB = getLowestPrice(p) || p.price;
      if (priceA > 0 && priceB > 0) {
        const ratio = Math.abs(priceB - priceA) / priceA;
        if (ratio < 0.35) score += 15;
      }
      score += computeDealScore(p) * 0.2;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.product);
}

export function getPersonalizedRecommendations(
  signals: UserSignal[],
  favoriteIds: string[] = [],
  limit = 8
): Product[] {
  const { products } = getCatalog();
  const exclude = new Set(favoriteIds);
  const categoryWeights = new Map<string, number>();
  const keywordWeights = new Map<string, number>();

  for (const s of signals) {
    if (s.payload?.category) {
      categoryWeights.set(
        s.payload.category,
        (categoryWeights.get(s.payload.category) ?? 0) + 1
      );
    }
    if (s.signalType === "search" && s.payload?.query) {
      for (const term of s.payload.query.toLowerCase().split(/\s+/)) {
        if (term.length >= 3) {
          keywordWeights.set(term, (keywordWeights.get(term) ?? 0) + 2);
        }
      }
    }
    if (s.productId) {
      const p = products.find((x) => x.id === s.productId);
      if (p) {
        categoryWeights.set(p.category, (categoryWeights.get(p.category) ?? 0) + 3);
        for (const kw of p.keywords) {
          keywordWeights.set(kw.toLowerCase(), (keywordWeights.get(kw.toLowerCase()) ?? 0) + 1);
        }
      }
    }
  }

  for (const fid of favoriteIds) {
    const p = products.find((x) => x.id === fid);
    if (p) {
      categoryWeights.set(p.category, (categoryWeights.get(p.category) ?? 0) + 5);
      for (const kw of p.keywords) {
        keywordWeights.set(kw.toLowerCase(), (keywordWeights.get(kw.toLowerCase()) ?? 0) + 2);
      }
    }
  }

  if (categoryWeights.size === 0 && keywordWeights.size === 0) {
    return getBestDealsToday(limit);
  }

  return products
    .filter((p) => !exclude.has(p.id))
    .map((p) => {
      let score = computeDealScore(p) * 0.4;
      score += (categoryWeights.get(p.category) ?? 0) * 8;
      for (const kw of p.keywords) {
        score += (keywordWeights.get(kw.toLowerCase()) ?? 0) * 4;
      }
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.product);
}

export function searchProductsRanked(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return rankProductsByDealScore(getCatalog().products);

  const terms = q.split(/\s+/).filter(Boolean);
  const { products } = getCatalog();

  const scored = products
    .map((p) => {
      const haystack = [p.name, p.description, ...p.keywords].join(" ").toLowerCase();
      const matches = terms.filter((t) => haystack.includes(t)).length;
      if (matches === 0) return null;
      const relevance = matches / terms.length;
      return { product: p, score: relevance * 60 + computeDealScore(p) * 0.4 };
    })
    .filter(Boolean) as { product: Product; score: number }[];

  return scored.sort((a, b) => b.score - a.score).map((x) => x.product);
}
