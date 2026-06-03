import historyData from "../../data/price-history.json";

export type PriceHistoryPoint = {
  date: string;
  price: number;
  source?: string;
};

type HistoryFile = {
  updatedAt?: string | null;
  products: Record<string, PriceHistoryPoint[]>;
};

const history = historyData as unknown as HistoryFile;

export function getPriceHistory(productId: string): PriceHistoryPoint[] {
  return history.products?.[productId] ?? [];
}

export function getPriceHistoryUpdatedAt(): string | undefined {
  const u = history.updatedAt;
  return u ?? undefined;
}

/** Variación % respecto al primer punto del historial. */
export function getPriceTrend(productId: string, currentPrice: number): number | null {
  const series = getPriceHistory(productId);
  if (series.length < 2 || currentPrice <= 0) return null;
  const first = series[0].price;
  if (first <= 0) return null;
  return Math.round(((currentPrice - first) / first) * 100);
}
