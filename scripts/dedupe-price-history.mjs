#!/usr/bin/env node
/** Limpia duplicados en data/price-history.json */
import { loadPriceHistory, savePriceHistory, dedupeSeries } from "./lib/price-history.mjs";

const history = loadPriceHistory();
let cleaned = 0;
for (const [id, series] of Object.entries(history.products ?? {})) {
  const before = series?.length ?? 0;
  const after = dedupeSeries(series).length;
  if (after !== before) cleaned++;
}
savePriceHistory(history);
console.log(`✓ Historial deduplicado: ${Object.keys(history.products ?? {}).length} series, ${cleaned} corregidas`);
