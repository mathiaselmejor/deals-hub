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
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/** Registra punto si el precio cambió o pasó >12h desde el último. */
export function recordPricePoint(history, productId, price, source = "amazon") {
  if (!productId || !price || price <= 0) return history;
  if (!history.products) history.products = {};
  const series = history.products[productId] ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const last = series[series.length - 1];

  if (last) {
    const sameDay = last.date === today;
    const samePrice = Math.abs(last.price - price) < 0.02;
    if (sameDay && samePrice) return history;
    const lastTime = new Date(last.date).getTime();
    if (samePrice && Date.now() - lastTime < 12 * 3600 * 1000) return history;
  }

  series.push({ date: today, price: Math.round(price * 100) / 100, source });
  history.products[productId] = series.slice(-MAX_POINTS);
  return history;
}
