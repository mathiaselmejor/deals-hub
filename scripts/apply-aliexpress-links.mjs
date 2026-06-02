#!/usr/bin/env node
/** Aplica URLs AliExpress desde data/aliexpress-links.json al catálogo AliExpress. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const targetFile = path.join(dataDir, "extra-products-aliexpress.json");
const linksFile = path.join(dataDir, "aliexpress-links.json");

const links = JSON.parse(fs.readFileSync(linksFile, "utf-8"));
delete links._comment;

const data = JSON.parse(fs.readFileSync(targetFile, "utf-8"));

function itemUrl(itemId) {
  return `https://es.aliexpress.com/item/${String(itemId).replace(/\D/g, "")}.html`;
}

function linkKindFor(url, override) {
  if (override) return override;
  return /\/item\/\d+/i.test(url) ? "direct" : "search";
}

let updated = 0;

for (const product of data.products ?? []) {
  const entry = links[product.id];
  if (!entry) continue;

  const url = entry.itemId ? itemUrl(entry.itemId) : entry.url;
  const linkKind = linkKindFor(url, entry.linkKind);
  const priceEstimated = linkKind === "search";

  const offer = product.offers?.find((o) => o.store === "aliexpress");
  if (!offer) continue;

  offer.url = url;
  offer.directUrl = linkKind === "direct" ? url : undefined;
  offer.linkKind = linkKind;
  offer.priceEstimated = priceEstimated;
  offer.note = entry.note ?? offer.note ?? "Comisión AliExpress Portals activa";

  if (entry.imageUrl) product.image = entry.imageUrl;
  updated++;
}

data.lastUpdated = new Date().toISOString().slice(0, 10);
fs.writeFileSync(targetFile, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`✓ extra-products-aliexpress.json — ${updated} productos actualizados`);
