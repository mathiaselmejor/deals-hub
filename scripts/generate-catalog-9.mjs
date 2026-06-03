#!/usr/bin/env node
/** Genera data/extra-products-9.json — complementos transparentes c9. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildCatalog9Products, CATALOG_9_CATEGORIES } from "./lib/catalog-9-seeds.mjs";
import { loadExistingNames } from "./lib/catalog-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../data");
const OUT = path.join(dataDir, "extra-products-9.json");

const existingNames = loadExistingNames(dataDir, fs);
const products = buildCatalog9Products(existingNames);

if (products.length < 1200) {
  console.error(`FAIL: expected >= 1200 products, got ${products.length}`);
  process.exit(1);
}

fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      lastUpdated: new Date().toISOString().slice(0, 10),
      categories: CATALOG_9_CATEGORIES,
      products,
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`Wrote ${products.length} transparent products → ${OUT}`);
