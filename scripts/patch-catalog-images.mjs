#!/usr/bin/env node
/** Sincroniza product.image con ASIN verificado (widget Amazon). */
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
  "extra-products-6.json",
  "extra-products-aliexpress.json",
  "extra-products-awin.json",
  "catalog-monetized.json",
];

function amazonImage(asin) {
  const clean = asin.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=ES&ASIN=${clean}&ServiceVersion=20070822&ID=AsinImage&Format=_SL500_`;
}

const map = JSON.parse(fs.readFileSync(path.join(dataDir, "direct-asins.json"), "utf-8"));
delete map._comment;

let patched = 0;
for (const file of FILES) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  let changed = false;
  for (const prod of data.products ?? []) {
    const entry = map[prod.id];
    const mapped =
      typeof entry === "string" ? entry : entry?.amazon ?? entry?.asin;
    const offerAsin = prod.offers?.find(
      (o) => o.store === "amazon" && o.condition !== "refurbished",
    );
    const asin =
      mapped ??
      offerAsin?.asin ??
      extractAmazonAsin(offerAsin?.url ?? "") ??
      extractAmazonAsin(offerAsin?.directUrl ?? "");
    if (!asin) {
      if (prod.image?.includes("unsplash.com")) {
        prod.image = "/placeholder-product.svg";
        changed = true;
        patched++;
      }
      continue;
    }
    const img = amazonImage(asin);
    if (prod.image !== img) {
      prod.image = img;
      changed = true;
      patched++;
    }
    if (typeof entry === "object" && entry && !entry.imageUrl) {
      entry.imageUrl = img;
    } else if (!entry) {
      map[prod.id] = { amazon: asin, imageUrl: img };
    }
  }
  if (changed) fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

fs.writeFileSync(
  path.join(dataDir, "direct-asins.json"),
  JSON.stringify(
    {
      _comment: "ASIN / URL directa por producto. El motor de ofertas aplica esto a todo el catálogo.",
      ...map,
    },
    null,
    2,
  ) + "\n",
);
console.log(`✓ Imágenes parcheadas: ${patched}`);
