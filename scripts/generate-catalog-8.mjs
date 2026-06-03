#!/usr/bin/env node
/** Genera data/extra-products-8.json — accesorios transparentes c8. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildCatalog8Products, CATALOG_8_CATEGORIES } from "./lib/catalog-8-seeds.mjs";
import { loadExistingNames } from "./lib/catalog-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../data");
const OUT = path.join(dataDir, "extra-products-8.json");

const existingNames = loadExistingNames(dataDir, fs);
const products = buildCatalog8Products(existingNames);

if (products.length < 2500) {
  console.error(`FAIL: expected >= 2500 products, got ${products.length}`);
  process.exit(1);
}

fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      lastUpdated: new Date().toISOString().slice(0, 10),
      categories: CATALOG_8_CATEGORIES,
      products,
    },
    null,
    2,
  ),
  "utf8",
);

const byCat = {};
for (const p of products) {
  byCat[p.category] = (byCat[p.category] || 0) + 1;
}
console.log(`Wrote ${products.length} transparent products → ${OUT}`);
console.log("Per category:", JSON.stringify(byCat));
