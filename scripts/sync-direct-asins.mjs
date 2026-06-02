#!/usr/bin/env node
/**
 * Rellena data/direct-asins.json con ASINs ya presentes en URLs del catálogo.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { extractAmazonAsin } from "./lib/store-urls.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");

const FILES = [
  "products.json",
  "extra-products.json",
  "extra-products-2.json",
  "extra-products-3.json",
  "extra-products-4.json",
  "extra-products-5.json",
  "catalog-monetized.json",
];

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf-8"));
}

const mapPath = path.join(dataDir, "direct-asins.json");
const map = loadJson("direct-asins.json");
delete map._comment;

let added = 0;
const seenAsin = new Map();

for (const file of FILES) {
  const data = loadJson(file);
  for (const p of data.products ?? []) {
    for (const o of p.offers ?? []) {
      if (o.store !== "amazon" || o.condition === "refurbished") continue;
      const asin = o.asin ?? extractAmazonAsin(o.url) ?? extractAmazonAsin(o.directUrl);
      if (!asin) continue;
      if (seenAsin.has(asin) && seenAsin.get(asin) !== p.id) {
        // ASIN duplicado en otro producto — no sobrescribir entrada manual
        continue;
      }
      seenAsin.set(asin, p.id);
      const cur = map[p.id];
      const curAsin = typeof cur === "string" ? cur : cur?.amazon;
      if (curAsin === asin) continue;
      if (!cur) {
        map[p.id] = { amazon: asin };
        added++;
      }
    }
  }
}

const out = {
  _comment: "ASIN / URL directa por producto. El motor de ofertas aplica esto a todo el catálogo.",
  ...map,
};
fs.writeFileSync(mapPath, JSON.stringify(out, null, 2) + "\n");
console.log(`✅ direct-asins: +${added} nuevos (${Object.keys(map).length} total)`);
