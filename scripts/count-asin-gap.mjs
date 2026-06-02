import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { extractAmazonAsin } from "./lib/store-urls.mjs";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const FILES = [
  "products.json",
  "extra-products.json",
  "extra-products-2.json",
  "extra-products-3.json",
  "extra-products-4.json",
  "extra-products-5.json",
  "catalog-monetized.json",
];

const ids = new Map();
for (const f of FILES) {
  const d = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf-8"));
  for (const p of d.products ?? []) {
    if (ids.has(p.id)) continue;
    const am = (p.offers ?? []).find((o) => o.store === "amazon" && o.condition !== "refurbished");
    const asin =
      am?.asin ?? extractAmazonAsin(am?.url) ?? extractAmazonAsin(am?.directUrl) ?? null;
    ids.set(p.id, { name: p.name, asin, hasAmazon: !!am });
  }
}

const map = JSON.parse(fs.readFileSync(path.join(dataDir, "direct-asins.json"), "utf-8"));
delete map._comment;

let need = 0;
let have = 0;
for (const [id, v] of ids) {
  const m = map[id];
  const mapped = typeof m === "string" ? m : m?.amazon;
  if (v.asin || mapped) have++;
  else if (v.hasAmazon) need++;
}

console.log(JSON.stringify({ unique: ids.size, mapped: Object.keys(map).length, have, need }, null, 2));
