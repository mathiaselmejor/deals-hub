/** Historial de precios verificados — máx. 90 días por producto. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data");
const HISTORY_PATH = path.join(dataDir, "price-history.json");
const MAX_POINTS = 90;

export function loadPriceHistory() {
  if (!fs.existsSync(HISTORY_PATH)) {
    return { updatedAt: null, products: {} };
  }
  return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));
}

export function savePriceHistory(data) {
  data.updatedAt = new Date().toISOString();
  if (data.products) {
    for (const id of Object.keys(data.products)) {
      data.products[id] = dedupeSeries(data.products[id]);
    }
  }
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/** Un punto por día (conserva el último precio del día). */
export function dedupeSeries(series) {
  if (!Array.isArray(series) || series.length === 0) return [];
  const byDay = new Map();
  for (const pt of series) {
    if (!pt?.date || !pt.price || pt.price <= 0) continue;
    byDay.set(pt.date, {
      date: pt.date,
      price: Math.round(pt.price * 100) / 100,
      source: pt.source ?? "amazon",
    });
  }
  return [...byDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-MAX_POINTS);
}

/** Registra o actualiza el precio del día. */
export function recordPricePoint(history, productId, price, source = "amazon") {
  if (!productId || !price || price <= 0) return history;
  if (!history.products) history.products = {};
  const today = new Date().toISOString().slice(0, 10);
  const rounded = Math.round(price * 100) / 100;
  const series = dedupeSeries(history.products[productId] ?? []);
  const last = series[series.length - 1];

  if (last?.date === today && Math.abs(last.price - rounded) < 0.02) {
    history.products[productId] = series;
    return history;
  }

  if (last?.date === today) {
    series[series.length - 1] = { date: today, price: rounded, source };
  } else {
    series.push({ date: today, price: rounded, source });
  }

  history.products[productId] = series.slice(-MAX_POINTS);
  return history;
}
