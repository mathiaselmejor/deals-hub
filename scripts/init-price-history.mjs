#!/usr/bin/env node
/** Inicializa historial desde catalog-live.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadPriceHistory, savePriceHistory, recordPricePoint } from "./lib/price-history.mjs";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data");
const livePath = path.join(dataDir, "catalog-live.json");

if (!fs.existsSync(livePath)) {
  console.log("No hay catalog-live.json");
  process.exit(0);
}

const live = JSON.parse(fs.readFileSync(livePath, "utf-8"));
let history = loadPriceHistory();
let added = 0;

for (const [id, entry] of Object.entries(live.products ?? {})) {
  if (entry?.price > 0) {
    history = recordPricePoint(history, id, entry.price, entry.source ?? "amazon");
    added++;
  }
}

savePriceHistory(history);
console.log(`✓ Historial inicializado: ${added} productos, ${Object.keys(history.products).length} series`);
