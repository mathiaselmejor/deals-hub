/**
 * Genera data/extra-products-6.json — catálogo masivo c6.
 * node scripts/generate-catalog-6.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CATALOG_6_CATEGORIES, buildCatalog6Products } from "./lib/catalog-6-seeds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../data/extra-products-6.json");

const products = buildCatalog6Products();

fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      lastUpdated: new Date().toISOString().slice(0, 10),
      categories: CATALOG_6_CATEGORIES,
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
console.log(`Wrote ${products.length} products, ${CATALOG_6_CATEGORIES.length} new categories → ${OUT}`);
console.log("Per category:", JSON.stringify(byCat, null, 0));
