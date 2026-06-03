/**
 * Genera data/extra-products-7.json — catálogo masivo c7.
 * node scripts/generate-catalog-7.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildCatalog7Products, CATALOG_7_CATEGORIES } from "./lib/catalog-7-seeds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../data");
const OUT = path.join(dataDir, "extra-products-7.json");

const existingNames = new Set();
for (const file of fs.readdirSync(dataDir)) {
  if (!file.endsWith(".json")) continue;
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
    for (const p of data.products ?? []) {
      if (p.name) existingNames.add(p.name);
    }
  } catch {
    /* skip invalid */
  }
}

const products = buildCatalog7Products(existingNames);

if (products.length < 3620) {
  console.error(`FAIL: expected >= 3620 products, got ${products.length}`);
  process.exit(1);
}

fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      lastUpdated: new Date().toISOString().slice(0, 10),
      categories: CATALOG_7_CATEGORIES,
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
console.log(`Wrote ${products.length} products, ${CATALOG_7_CATEGORIES.length} new categories → ${OUT}`);
console.log("Per category:", JSON.stringify(byCat, null, 0));
