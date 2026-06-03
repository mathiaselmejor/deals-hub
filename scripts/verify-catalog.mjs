#!/usr/bin/env node
/**
 * Auditoría local del catálogo: precios, imágenes, ofertas.
 * Uso: node scripts/verify-catalog.mjs [--images] [--sample=80]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkImages = args.includes("--images");
const sampleArg = args.find((a) => a.startsWith("--sample="));
const imageSample = sampleArg ? parseInt(sampleArg.split("=")[1], 10) : 60;

function loadJson(name) {
  const p = path.join(root, "data", name);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null;
}

function mergeCatalog() {
  const base = loadJson("products.json");
  const extra = loadJson("extra-products.json");
  const extra2 = loadJson("extra-products-2.json");
  const extra3 = loadJson("extra-products-3.json");
  const extra4 = loadJson("extra-products-4.json");
  const extra5 = loadJson("extra-products-5.json");
  const extra6 = loadJson("extra-products-6.json");
  const extra7 = loadJson("extra-products-7.json");
  const extra8 = loadJson("extra-products-8.json");
  const extra9 = loadJson("extra-products-9.json");
  const extraAli = loadJson("extra-products-aliexpress.json");
  const extraAwin = loadJson("extra-products-awin.json");
  const monetized = loadJson("catalog-monetized.json");

  const byId = new Map();
  const layers = [
    ...(monetized?.products ?? []),
    ...(extra4?.products ?? []),
    ...(extra3?.products ?? []),
    ...(extra2?.products ?? []),
    ...(extra?.products ?? []),
    ...(extra5?.products ?? []),
    ...(extra6?.products ?? []),
    ...(extra7?.products ?? []),
    ...(extra8?.products ?? []),
    ...(extra9?.products ?? []),
    ...(extraAli?.products ?? []),
    ...(extraAwin?.products ?? []),
    ...(base?.products ?? []),
  ];
  for (const p of layers) byId.set(p.id, p);
  return [...byId.values()];
}

function minOfferPrice(product) {
  const prices = (product.offers ?? []).map((o) => o.price).filter((p) => typeof p === "number" && p > 0);
  return prices.length ? Math.min(...prices) : 0;
}

function isBadImageUrl(url) {
  if (!url || typeof url !== "string") return true;
  const u = url.trim();
  if (!u) return true;
  if (u.startsWith("/")) return false;
  try {
    const parsed = new URL(u);
    return !["http:", "https:"].includes(parsed.protocol);
  } catch {
    return true;
  }
}

function isTrustedImageUrl(url) {
  if (!url || url.startsWith("/")) return true;
  return (
    url.includes("media-amazon.com") ||
    url.includes("amazon-adsystem.com") ||
    url.includes("ssl-images-amazon.com")
  );
}

async function headImage(url, timeoutMs = 8000) {
  if (isTrustedImageUrl(url)) return { ok: true, status: "trusted" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "DealsHub-Verify/1.0" },
    });
    clearTimeout(t);
    if (res.ok) return { ok: true, status: res.status };
    const getRes = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
      headers: { "User-Agent": "DealsHub-Verify/1.0", Range: "bytes=0-0" },
    });
    return { ok: getRes.ok, status: getRes.status };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, error: e instanceof Error ? e.message : "fail" };
  }
}

const products = mergeCatalog();
const issues = {
  noImage: [],
  badImageUrl: [],
  zeroPrice: [],
  priceMismatch: [],
  noOffers: [],
  noDirectAmazon: [],
  stalePrice: [],
  duplicateIds: [],
};

const now = Date.now();
const STALE_DAYS = 14;

for (const p of products) {
  if (isBadImageUrl(p.image)) {
    if (!p.image) issues.noImage.push(p.id);
    else issues.badImageUrl.push({ id: p.id, image: p.image?.slice(0, 80) });
  }

  const minOffer = minOfferPrice(p);
  if (p.price <= 0 && minOffer <= 0) issues.zeroPrice.push(p.id);

  if (Math.abs((p.price ?? 0) - minOffer) > 2 && minOffer > 0) {
    issues.priceMismatch.push({
      id: p.id,
      cardPrice: p.price,
      minOffer,
      diff: Math.round((p.price - minOffer) * 100) / 100,
    });
  }

  if (!p.offers?.length) issues.noOffers.push(p.id);

  const amazon = p.offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished");
  if (!amazon?.asin && !p.offers?.some((o) => o.linkKind === "direct")) {
    issues.noDirectAmazon.push(p.id);
  }

  const updated = p.priceUpdatedAt || amazon?.lastChecked;
  if (updated) {
    const age = (now - new Date(updated).getTime()) / (86400 * 1000);
    if (age > STALE_DAYS) issues.stalePrice.push({ id: p.id, days: Math.floor(age) });
  }
}

const report = {
  total: products.length,
  issues: {
    noImage: issues.noImage.length,
    badImageUrl: issues.badImageUrl.length,
    zeroPrice: issues.zeroPrice.length,
    priceMismatch: issues.priceMismatch.length,
    noOffers: issues.noOffers.length,
    noDirectAmazon: issues.noDirectAmazon.length,
    stalePrice: issues.stalePrice.length,
  },
  samples: {
    priceMismatch: issues.priceMismatch.slice(0, 8),
    zeroPrice: issues.zeroPrice.slice(0, 8),
    noImage: issues.noImage.slice(0, 8),
    badImageUrl: issues.badImageUrl.slice(0, 5),
    stalePrice: issues.stalePrice.slice(0, 5),
  },
};

let imageFailures = [];
if (checkImages) {
  const pool = products.filter((p) => p.image && !p.image.startsWith("/"));
  const picked = [];
  const step = Math.max(1, Math.floor(pool.length / imageSample));
  for (let i = 0; i < pool.length && picked.length < imageSample; i += step) picked.push(pool[i]);
  console.log(`Comprobando ${picked.length} imágenes (HEAD/GET)...`);
  const concurrency = 8;
  for (let i = 0; i < picked.length; i += concurrency) {
    const batch = picked.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (p) => {
        const r = await headImage(p.image);
        return { id: p.id, ok: r.ok, status: r.status, error: r.error };
      }),
    );
    for (const r of results) {
      if (!r.ok) imageFailures.push(r);
    }
  }
  report.imageCheck = {
    sampled: picked.length,
    failed: imageFailures.length,
    failures: imageFailures.slice(0, 12),
  };
}

const critical =
  issues.noImage.length +
  issues.zeroPrice.length +
  issues.noOffers.length +
  (imageFailures.length > imageSample * 0.15 ? imageFailures.length : 0);

report.status = critical === 0 && issues.priceMismatch.length < 20 ? "ok" : "warn";
console.log(JSON.stringify(report, null, 2));
