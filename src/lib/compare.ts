import { computeDealScore } from "./algorithms";
import {
  formatPrice,
  formatReviews,
  getCatalog,
  getCategoryLabel,
  getLowestPrice,
  getProductById,
  getSavings,
} from "./products";
import type { Product } from "./types";

export type CompareWinner = "a" | "b" | "tie" | null;

export type CompareRowKind = "score" | "price" | "percent" | "rating" | "count" | "text" | "boolean";

export interface CompareRow {
  id: string;
  label: string;
  valueA: string;
  valueB: string;
  winner: CompareWinner;
  kind: CompareRowKind;
  /** 0–100 bar fill for product A when comparable */
  barA?: number;
  barB?: number;
  hint?: string;
}

export interface ProductCompareResult {
  productA: Product;
  productB: Product;
  scoreA: number;
  scoreB: number;
  winsA: number;
  winsB: number;
  overallWinner: CompareWinner;
  rows: CompareRow[];
}

function winnerFromNumbers(
  a: number,
  b: number,
  lowerIsBetter = false
): { winner: CompareWinner; barA: number; barB: number } {
  if (a === b || (a <= 0 && b <= 0)) {
    return { winner: "tie", barA: 50, barB: 50 };
  }
  const max = Math.max(a, b, 1);
  const barA = Math.round((a / max) * 100);
  const barB = Math.round((b / max) * 100);
  if (lowerIsBetter) {
    return { winner: a < b ? "a" : "b", barA, barB };
  }
  return { winner: a > b ? "a" : "b", barA, barB };
}

function parseNumeric(value: string): number | null {
  const match = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

function countWins(rows: CompareRow[]): { winsA: number; winsB: number } {
  let winsA = 0;
  let winsB = 0;
  for (const row of rows) {
    if (row.winner === "a") winsA += 1;
    if (row.winner === "b") winsB += 1;
  }
  return { winsA, winsB };
}

export function buildProductComparison(productA: Product, productB: Product): ProductCompareResult {
  const rows: CompareRow[] = [];
  const scoreA = computeDealScore(productA);
  const scoreB = computeDealScore(productB);
  const priceA = getLowestPrice(productA) || productA.price;
  const priceB = getLowestPrice(productB) || productB.price;
  const savingsA = getSavings(productA);
  const savingsB = getSavings(productB);
  const directA = productA.offers.filter((o) => o.linkKind === "direct").length;
  const directB = productB.offers.filter((o) => o.linkKind === "direct").length;

  const dealRow = winnerFromNumbers(scoreA, scoreB);
  rows.push({
    id: "deal-score",
    label: "Deal Score",
    valueA: `${scoreA}/100`,
    valueB: `${scoreB}/100`,
    winner: dealRow.winner,
    kind: "score",
    barA: dealRow.barA,
    barB: dealRow.barB,
    hint: "Precio, descuento, valoración y señales editoriales",
  });

  if (priceA > 0 || priceB > 0) {
    const priceRow = winnerFromNumbers(priceA || Infinity, priceB || Infinity, true);
    rows.push({
      id: "best-price",
      label: "Mejor precio",
      valueA: priceA > 0 ? formatPrice(priceA) : "—",
      valueB: priceB > 0 ? formatPrice(priceB) : "—",
      winner: priceA <= 0 || priceB <= 0 ? null : priceRow.winner,
      kind: "price",
      barA: priceRow.barA,
      barB: priceRow.barB,
      hint: "Precio más bajo entre tiendas afiliadas",
    });
  }

  if (savingsA > 0 || savingsB > 0) {
    const savingsRow = winnerFromNumbers(savingsA, savingsB);
    rows.push({
      id: "savings",
      label: "Ahorro vs PVP",
      valueA: savingsA > 0 ? formatPrice(savingsA) : "—",
      valueB: savingsB > 0 ? formatPrice(savingsB) : "—",
      winner: savingsA === savingsB ? "tie" : savingsRow.winner,
      kind: "price",
      barA: savingsRow.barA,
      barB: savingsRow.barB,
    });
  }

  const discountRow = winnerFromNumbers(productA.discount, productB.discount);
  rows.push({
    id: "discount",
    label: "Descuento",
    valueA: productA.discount > 0 ? `-${productA.discount}%` : "—",
    valueB: productB.discount > 0 ? `-${productB.discount}%` : "—",
    winner: productA.discount === productB.discount ? "tie" : discountRow.winner,
    kind: "percent",
    barA: discountRow.barA,
    barB: discountRow.barB,
  });

  const ratingRow = winnerFromNumbers(productA.rating, productB.rating);
  rows.push({
    id: "rating",
    label: "Valoración",
    valueA: `${productA.rating}/5`,
    valueB: `${productB.rating}/5`,
    winner: ratingRow.winner,
    kind: "rating",
    barA: ratingRow.barA,
    barB: ratingRow.barB,
  });

  const reviewsRow = winnerFromNumbers(productA.reviews, productB.reviews);
  rows.push({
    id: "reviews",
    label: "Opiniones",
    valueA: formatReviews(productA.reviews),
    valueB: formatReviews(productB.reviews),
    winner: reviewsRow.winner,
    kind: "count",
    barA: reviewsRow.barA,
    barB: reviewsRow.barB,
  });

  const storesRow = winnerFromNumbers(productA.offers.length, productB.offers.length);
  rows.push({
    id: "stores",
    label: "Tiendas comparadas",
    valueA: `${productA.offers.length}`,
    valueB: `${productB.offers.length}`,
    winner: storesRow.winner,
    kind: "count",
    barA: storesRow.barA,
    barB: storesRow.barB,
    hint: "Más tiendas = más opciones de compra",
  });

  const directRow = winnerFromNumbers(directA, directB);
  rows.push({
    id: "direct-links",
    label: "Fichas directas",
    valueA: `${directA}`,
    valueB: `${directB}`,
    winner: directRow.winner,
    kind: "count",
    barA: directRow.barA,
    barB: directRow.barB,
    hint: "Enlaces a ficha de producto (no búsqueda genérica)",
  });

  const specKeys = new Set([
    ...Object.keys(productA.specs ?? {}),
    ...Object.keys(productB.specs ?? {}),
  ]);

  for (const key of [...specKeys].sort((a, b) => a.localeCompare(b, "es"))) {
    const valA = productA.specs?.[key];
    const valB = productB.specs?.[key];
    if (!valA && !valB) continue;

    const numA = valA ? parseNumeric(valA) : null;
    const numB = valB ? parseNumeric(valB) : null;

    if (numA != null && numB != null) {
      const specRow = winnerFromNumbers(numA, numB);
      rows.push({
        id: `spec-${key}`,
        label: key,
        valueA: valA ?? "—",
        valueB: valB ?? "—",
        winner: numA === numB ? "tie" : specRow.winner,
        kind: "text",
        barA: specRow.barA,
        barB: specRow.barB,
      });
    } else {
      rows.push({
        id: `spec-${key}`,
        label: key,
        valueA: valA ?? "—",
        valueB: valB ?? "—",
        winner: valA && !valB ? "a" : valB && !valA ? "b" : "tie",
        kind: "text",
      });
    }
  }

  const { winsA, winsB } = countWins(rows);
  let overallWinner: CompareWinner = "tie";
  if (winsA > winsB) overallWinner = "a";
  if (winsB > winsA) overallWinner = "b";
  if (scoreA !== scoreB && winsA === winsB) {
    overallWinner = scoreA > scoreB ? "a" : "b";
  }

  return {
    productA,
    productB,
    scoreA,
    scoreB,
    winsA,
    winsB,
    overallWinner,
    rows,
  };
}

export function getComparePair(
  idA?: string | null,
  idB?: string | null
): { productA: Product | null; productB: Product | null } {
  const productA = idA ? getProductById(idA) ?? null : null;
  const productB = idB ? getProductById(idB) ?? null : null;
  return { productA, productB };
}

export function getCompareCatalogOptions(): {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  image: string;
  price: number;
}[] {
  return getCatalog().products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    categoryLabel: getCategoryLabel(p.category),
    image: p.image,
    price: getLowestPrice(p) || p.price,
  }));
}
