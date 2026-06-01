#!/usr/bin/env node
/**
 * Motor de ofertas DealsHub
 * - Enlaces directos (Amazon /dp/, etc.)
 * - Actualización de precios (Amazon con ASIN)
 * - Rotación diaria trending / destacados / oferta del día
 *
 * Uso: node scripts/offer-engine.mjs
 * Cron: POST /api/cron/refresh-catalog (Vercel)
 */
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
  "catalog-monetized.json",
];

function loadJson(name) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function saveJson(name, data) {
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shuffleWithSeed(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isPlausibleScrapedPrice(scraped, product) {
  if (!scraped || scraped <= 0) return false;
  const anchor =
    product.price > 20 ? product.price : product.originalPrice > 20 ? product.originalPrice : null;
  if (!anchor) return scraped >= 5 && scraped <= 15000;
  const min = anchor * 0.35;
  const max = anchor * 2.5;
  return scraped >= min && scraped <= max;
}

async function fetchAmazonPrice(asin) {
  const url = `https://www.amazon.es/dp/${asin}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const patterns = [
      /"priceAmount":\s*([\d.]+)/,
      /"price":\s*"([\d,]+)"/,
      /class="a-price-whole">([\d.]+)/,
      /a-offscreen">([\d,.]+)\s*€/,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        const p = parseFloat(m[1].replace(",", "."));
        if (p > 0 && p < 50000) return p;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeOffer(offer, product, asinMap) {
  const search = product.name.split("—")[0].trim();
  const mapVal = asinMap[product.id];
  const mappedAsin =
    typeof mapVal === "string" ? mapVal : mapVal?.amazon ?? mapVal?.asin;
  let asin = offer.asin ?? mappedAsin ?? extractAmazonAsin(offer.url);

  let url = offer.directUrl || offer.url;
  let linkKind = offer.linkKind || "search";
  let priceEstimated = offer.priceEstimated ?? true;

  if (offer.condition === "refurbished" && offer.store === "amazon" && asin) {
    url = amazonRenewedUrl(asin);
    linkKind = "direct";
    priceEstimated = false;
  } else if (offer.store === "amazon") {
    const direct = buildStoreProductUrl({ store: "amazon", search, asin });
    url = direct;
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
    lastChecked: new Date().toISOString(),
  };
}

function normalizeProduct(product, asinMap) {
  const offers = (product.offers || []).map((o) => normalizeOffer(o, product, asinMap));
  const newOffers = offers.filter((o) => o.condition !== "refurbished");
  const prices = newOffers.map((o) => o.price).filter((p) => p > 0);
  let price = prices.length ? Math.min(...prices) : product.price;
  let originalPrice = product.originalPrice || price * 1.12;
  if (originalPrice < price) originalPrice = Math.round(price * 1.12 * 100) / 100;
  const discount =
    originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : product.discount || 0;

  return {
    ...product,
    offers,
    price,
    originalPrice,
    discount,
    priceUpdatedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log("🔧 DealsHub Offer Engine\n");
  const asinMap = loadJson("direct-asins.json") || {};
  const live = { updatedAt: new Date().toISOString(), engineVersion: 1, products: {} };
  const allProducts = [];
  const updatedFiles = [];
  const fileCache = new Map();
  let fetchCount = 0;
  const MAX_PRICE_FETCH = 45;

  for (const file of FILES) {
    const data = loadJson(file);
    if (!data?.products) continue;
    fileCache.set(file, data);
    let changed = false;
    for (const p of data.products) {
      const normalized = normalizeProduct(p, asinMap);
      Object.assign(p, normalized);
      allProducts.push(p);

      const amazonOffer = p.offers?.find(
        (o) => o.store === "amazon" && o.condition !== "refurbished" && o.asin,
      );
      if (amazonOffer?.asin && fetchCount < MAX_PRICE_FETCH) {
        fetchCount++;
        const scraped = await fetchAmazonPrice(amazonOffer.asin);
        if (scraped && isPlausibleScrapedPrice(scraped, p)) {
          amazonOffer.price = scraped;
          amazonOffer.priceEstimated = false;
          amazonOffer.linkKind = "direct";
          amazonOffer.url = buildStoreProductUrl({
            store: "amazon",
            search: p.name,
            asin: amazonOffer.asin,
          });
          const prices = p.offers
            .filter((o) => o.condition !== "refurbished" && o.price > 0)
            .map((o) => o.price);
          p.price = Math.min(...prices);
          p.originalPrice = Math.max(p.originalPrice, p.price * 1.08);
          p.discount = Math.round((1 - p.price / p.originalPrice) * 100);
          live.products[p.id] = {
            price: p.price,
            originalPrice: p.originalPrice,
            discount: p.discount,
            offers: {
              amazon: {
                price: scraped,
                asin: amazonOffer.asin,
                url: amazonOffer.url,
                linkKind: "direct",
              },
            },
          };
          changed = true;
          process.stdout.write(".");
        }
        await new Promise((r) => setTimeout(r, 800));
      }
    }
    data.lastUpdated = dayKey();
    saveJson(file, data);
    if (changed) updatedFiles.push(file);
  }

  console.log("\n\n📦 Archivos actualizados:", updatedFiles.join(", ") || "(sin cambios de precio)");

  const dk = dayKey();
  const seed = hashSeed(dk);
  const scored = allProducts
    .map((p) => ({
      p,
      score: (p.discount || 0) * 2 + (p.rating || 0) * 10 + (p.trending ? 5 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const pool = scored.length > 40 ? scored.slice(0, 120) : scored;
  const shuffled = shuffleWithSeed(pool, seed);
  const trendingIds = shuffled.slice(0, 18).map((x) => x.p.id);
  const featuredIds = shuffleWithSeed(pool, seed + 1)
    .slice(0, 8)
    .map((x) => x.p.id);
  const dealOfDayId = shuffled[0]?.p.id ?? null;

  saveJson("rotation-state.json", {
    dayKey: dk,
    updatedAt: new Date().toISOString(),
    trendingIds,
    featuredIds,
    dealOfDayId,
  });

  saveJson("catalog-live.json", live);

  const idSet = (ids) => new Set(ids);
  const trendSet = idSet(trendingIds);
  const featSet = idSet(featuredIds);

  for (const file of FILES) {
    const data = fileCache.get(file) ?? loadJson(file);
    if (!data?.products) continue;
    for (const p of data.products) {
      Object.assign(p, normalizeProduct(p, asinMap));
      p.trending = trendSet.has(p.id);
      p.featured = featSet.has(p.id);
      p.dealOfDay = p.id === dealOfDayId;
    }
    data.lastUpdated = dk;
    saveJson(file, data);
  }

  console.log("🔄 Rotación:", dk);
  console.log("   Trending:", trendingIds.length);
  console.log("   Destacados:", featuredIds.length);
  console.log("   Oferta del día:", dealOfDayId);
  console.log("✅ Motor completado\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
