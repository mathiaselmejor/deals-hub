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
  return compactPriceHistory(history.products?.[productId] ?? []);
}

/** Un punto por día, ordenado cronológicamente. */
export function compactPriceHistory(series: PriceHistoryPoint[]): PriceHistoryPoint[] {
  const byDay = new Map<string, PriceHistoryPoint>();
  for (const pt of series) {
    if (!pt?.date || pt.price <= 0) continue;
    byDay.set(pt.date, pt);
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
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
