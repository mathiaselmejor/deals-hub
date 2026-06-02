#!/usr/bin/env node
/** Persiste enlaces directos Amazon (/dp/ASIN) en todos los JSON del catálogo. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildStoreProductUrl,
  extractAmazonAsin,
  amazonRenewedUrl,
  isSearchUrl,
} from "./lib/store-urls.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");

const FILES = [
  "products.json",
  "extra-products.json",
  "extra-products-2.json",
  "extra-products-3.json",
  "extra-products-4.json",
  "extra-products-5.json",
  "extra-products-aliexpress.json",
  "catalog-monetized.json",
];

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf-8"));
}

function saveJson(name, data) {
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function normalizeOffer(offer, product, asinMap) {
  const search = product.name.split("—")[0].trim();
  const mapVal = asinMap[product.id];
  const mappedAsin =
    typeof mapVal === "string" ? mapVal : mapVal?.amazon ?? mapVal?.asin;
  let asin = offer.asin ?? extractAmazonAsin(offer.url);
  if (offer.store === "amazon") {
    asin = mappedAsin ?? offer.asin ?? extractAmazonAsin(offer.url);
  }

  let url = offer.directUrl || offer.url;
  let linkKind = offer.linkKind || "search";
  let priceEstimated = offer.priceEstimated ?? true;

  if (offer.condition === "refurbished" && offer.store === "amazon" && asin) {
    url = amazonRenewedUrl(asin);
    linkKind = "direct";
    priceEstimated = false;
  } else if (offer.store === "amazon") {
    url = buildStoreProductUrl({ store: "amazon", search, asin });
    linkKind = asin ? "direct" : "search";
    priceEstimated = !asin;
  } else if (offer.directUrl) {
    url = offer.directUrl;
    linkKind = isSearchUrl(url, offer.store) ? "search" : "direct";
    priceEstimated = linkKind === "search";
  } else {
    url = buildStoreProductUrl({ store: offer.store, search, asin });
    linkKind = isSearchUrl(url, offer.store) ? "search" : "direct";
    priceEstimated = linkKind === "search";
  }

  return {
    ...offer,
    asin: asin || undefined,
    url,
    directUrl: linkKind === "direct" ? url : offer.directUrl,
    linkKind,
    priceEstimated,
  };
}

function normalizeProduct(product, asinMap) {
  const offers = (product.offers || []).map((o) => normalizeOffer(o, product, asinMap));
  const newOffers = offers.filter((o) => o.condition !== "refurbished");
  const prices = newOffers.map((o) => o.price).filter((p) => p > 0);
  const price = prices.length ? Math.min(...prices) : product.price;
  let originalPrice = product.originalPrice || price * 1.12;
  if (originalPrice < price) originalPrice = Math.round(price * 1.12 * 100) / 100;
  const discount =
    originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : product.discount || 0;

  const mapVal = asinMap[product.id];
  const mappedAsin =
    typeof mapVal === "string" ? mapVal : mapVal?.amazon ?? mapVal?.asin;
  const mappedImage = typeof mapVal === "object" ? mapVal?.imageUrl : null;
  const image =
    mappedImage ||
    (mappedAsin
      ? `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=ES&ASIN=${mappedAsin}&ServiceVersion=20070822&ID=AsinImage&Format=_SL500_`
      : product.image);

  return { ...product, offers, price, originalPrice, discount, image };
}

const asinMap = loadJson("direct-asins.json");
delete asinMap._comment;

let amazonDirect = 0;
let amazonSearch = 0;

for (const file of FILES) {
  const data = loadJson(file);
  if (!data?.products) continue;
  for (const p of data.products) {
    const n = normalizeProduct(p, asinMap);
    Object.assign(p, n);
    const am = p.offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished");
    if (am?.linkKind === "direct") amazonDirect++;
    else if (am) amazonSearch++;
  }
  saveJson(file, data);
  console.log("✓", file);
}

console.log(`\nAmazon: ${amazonDirect} ficha directa | ${amazonSearch} búsqueda`);
