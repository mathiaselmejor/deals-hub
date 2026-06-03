#!/usr/bin/env node
/** Índice ligero para búsqueda en cliente (sin cargar catálogo completo). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const FILES = [
  "products.json",
  "extra-products.json",
  "extra-products-2.json",
  "extra-products-3.json",
  "extra-products-4.json",
  "extra-products-5.json",
  "extra-products-6.json",
  "extra-products-7.json",
  "extra-products-8.json",
  "extra-products-9.json",
  "extra-products-aliexpress.json",
  "extra-products-awin.json",
  "catalog-monetized.json",
];

const byId = new Map();
for (const f of FILES) {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf-8"));
  for (const p of data.products ?? []) {
    byId.set(p.id, p);
  }
}

const index = [...byId.values()].map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  keywords: p.keywords ?? [],
  badge: p.badge ?? "",
}));

fs.writeFileSync(
  path.join(dataDir, "search-index.json"),
  JSON.stringify({ updatedAt: new Date().toISOString(), items: index }) + "\n",
);
console.log(`search-index.json: ${index.length} productos`);
