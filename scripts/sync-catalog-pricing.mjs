#!/usr/bin/env node
/** Persiste precios coherentes y sin descuentos ficticios en todos los JSON. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { applyConsistentProductPricing } from "./lib/product-pricing.mjs";
import { enrichProductMetadata } from "./lib/catalog-builder.mjs";
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
  "extra-products-7.json",
  "extra-products-8.json",
  "extra-products-9.json",
  "extra-products-aliexpress.json",
  "extra-products-awin.json",
  "catalog-monetized.json",
];

function amazonImage(asin) {
  const clean = asin.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=ES&ASIN=${clean}&ServiceVersion=20070822&ID=AsinImage&Format=_SL500_`;
}

const mapPath = path.join(dataDir, "direct-asins.json");
const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
delete map._comment;

let pricingFixed = 0;
let imagesFixed = 0;

for (const file of FILES) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  let changed = false;

  for (const prod of data.products ?? []) {
    const before = JSON.stringify(prod);
    const synced = applyConsistentProductPricing(prod);

    const entry = map[synced.id];
    const asin =
      (typeof entry === "object" ? entry?.amazon : entry) ??
      synced.offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished")?.asin ??
      extractAmazonAsin(synced.offers?.find((o) => o.store === "amazon")?.url ?? "");

    if (asin) {
      const img = amazonImage(asin);
      if (synced.image !== img) {
        synced.image = img;
        if (typeof entry === "object" && entry) entry.imageUrl = img;
        else if (entry) map[synced.id] = { amazon: asin, imageUrl: img };
        else map[synced.id] = { amazon: asin, imageUrl: img };
      }
    } else if (
      !synced.image ||
      synced.image.includes("unsplash.com") ||
      synced.image === "/placeholder-product.svg"
    ) {
      synced.image = "/placeholder-product.svg";
    }

    Object.assign(prod, synced);
    if (/^c[6-9]-/.test(prod.id ?? "")) {
      prod.listingKind = "catalog";
    }
    const needsEnrich =
      /^c[6-9]-/.test(prod.id ?? "") || (prod.listingKind === "catalog" && (!prod.specs || !prod.longDescription));
    if (needsEnrich) {
      enrichProductMetadata(prod);
    }
    const after = JSON.stringify(prod);
    if (before !== after) {
      changed = true;
      pricingFixed++;
      if (before.includes('"image"') && !before.includes(prod.image?.slice(0, 40) ?? "")) imagesFixed++;
    }
  }

  if (changed) {
    data.lastUpdated = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
    console.log(`✓ ${file}`);
  }
}

fs.writeFileSync(
  mapPath,
  JSON.stringify(
    {
      _comment: "ASIN / URL directa por producto. El motor de ofertas aplica esto a todo el catálogo.",
      ...map,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\n✓ Precios sincronizados: ${pricingFixed} | Imágenes: ${imagesFixed}`);
