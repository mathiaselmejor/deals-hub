#!/usr/bin/env node
/**
 * Análisis completo de calidad del catálogo.
 * node scripts/catalog-analysis.mjs [--json]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const writeJson = process.argv.includes("--json");

function load(name) {
  const p = path.join(dataDir, name);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null;
}

function mergeCatalog() {
  const base = load("products.json");
  const extra = load("extra-products.json");
  const extra2 = load("extra-products-2.json");
  const extra3 = load("extra-products-3.json");
  const extra4 = load("extra-products-4.json");
  const extra5 = load("extra-products-5.json");
  const extra6 = load("extra-products-6.json");
  const extra7 = load("extra-products-7.json");
  const extra8 = load("extra-products-8.json");
  const extra9 = load("extra-products-9.json");
  const extraAli = load("extra-products-aliexpress.json");
  const extraAwin = load("extra-products-awin.json");
  const monetized = load("catalog-monetized.json");

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

const products = mergeCatalog();
const asinMap = load("direct-asins.json") ?? {};
delete asinMap._comment;

const stats = {
  generatedAt: new Date().toISOString(),
  total: products.length,
  images: { amazonWidget: 0, amazonCdn: 0, placeholder: 0, other: 0 },
  pricing: {
    verifiedDisplay: 0,
    orientative: 0,
    withDiscount: 0,
    zeroPrice: 0,
    priceMismatch: 0,
  },
  amazon: { directLink: 0, asinInMap: 0, verifiedOffer: 0, searchOnly: 0 },
  metadata: { withSpecs: 0, withLongDesc: 0, withFaq: 0, catalogListing: 0 },
  batches: {},
  categories: {},
  qualityScore: 0,
  recommendations: [],
};

function batchOf(id) {
  const m = id?.match(/^c(\d)-/);
  return m ? `c${m[1]}` : "curated";
}

function isVerifiedProduct(p) {
  const display = Math.min(...(p.offers ?? []).filter((o) => o.condition !== "refurbished" && o.price > 0).map((o) => o.price));
  if (!display || !Number.isFinite(display)) return false;
  return (p.offers ?? []).some(
    (o) => o.priceEstimated === false && o.condition !== "refurbished" && Math.abs(o.price - display) < 0.03,
  );
}

for (const p of products) {
  const img = p.image ?? "";
  if (img.includes("amazon-adsystem") || img.includes("media-amazon")) stats.images.amazonWidget++;
  else if (img.includes("ssl-images-amazon")) stats.images.amazonCdn++;
  else if (img.includes("placeholder")) stats.images.placeholder++;
  else stats.images.other++;

  if (p.price <= 0) stats.pricing.zeroPrice++;
  if (p.discount > 0) stats.pricing.withDiscount++;
  if (isVerifiedProduct(p)) stats.pricing.verifiedDisplay++;
  else if (p.price > 0) stats.pricing.orientative++;

  const minO = Math.min(...(p.offers ?? []).map((o) => o.price).filter((x) => x > 0));
  if (minO > 0 && Math.abs(p.price - minO) > 2) stats.pricing.priceMismatch++;

  const am = p.offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished");
  if (am?.linkKind === "direct" || am?.asin) stats.amazon.directLink++;
  if (asinMap[p.id]) stats.amazon.asinInMap++;
  if (am?.priceEstimated === false) stats.amazon.verifiedOffer++;
  else stats.amazon.searchOnly++;

  if (p.specs) stats.metadata.withSpecs++;
  if (p.longDescription) stats.metadata.withLongDesc++;
  if (p.faq?.length) stats.metadata.withFaq++;
  if (p.listingKind === "catalog") stats.metadata.catalogListing++;

  const batch = batchOf(p.id);
  if (!stats.batches[batch]) {
    stats.batches[batch] = { count: 0, amazonImage: 0, placeholder: 0, verified: 0 };
  }
  stats.batches[batch].count++;
  if (img.includes("amazon") && !img.includes("placeholder")) stats.batches[batch].amazonImage++;
  else if (img.includes("placeholder")) stats.batches[batch].placeholder++;
  if (isVerifiedProduct(p)) stats.batches[batch].verified++;

  stats.categories[p.category] = (stats.categories[p.category] ?? 0) + 1;
}

const imgRealPct = Math.round(((stats.images.amazonWidget + stats.images.amazonCdn + stats.images.other) / stats.total) * 100);
const verifiedPct = Math.round((stats.pricing.verifiedDisplay / stats.total) * 100);
const asinPct = Math.round((stats.amazon.asinInMap / stats.total) * 100);

stats.qualityScore = Math.round(
  imgRealPct * 0.35 + verifiedPct * 0.35 + (100 - Math.round((stats.pricing.priceMismatch / stats.total) * 100)) * 0.15 + (stats.metadata.withSpecs / stats.total) * 100 * 0.15,
);

if (stats.images.placeholder > stats.total * 0.5) {
  stats.recommendations.push(`Resolver ASINs: ${stats.images.placeholder} productos con placeholder (${Math.round((stats.images.placeholder / stats.total) * 100)}%)`);
}
if (stats.pricing.orientative > stats.total * 0.8) {
  stats.recommendations.push("Ejecutar offer-engine con más fetch Amazon (precios verificados)");
}
if (stats.pricing.priceMismatch > 0) {
  stats.recommendations.push(`Corregir ${stats.pricing.priceMismatch} desajustes card vs oferta mínima`);
}
if (Object.keys(asinMap).length < stats.total * 0.3) {
  stats.recommendations.push(`Ampliar direct-asins.json (${Object.keys(asinMap).length} ASINs / ${stats.total} productos)`);
}

stats.summary = {
  realImagesPct: imgRealPct,
  verifiedPricesPct: verifiedPct,
  asinMapPct: asinPct,
  directAmazonLinks: stats.amazon.directLink,
  qualityScore: stats.qualityScore,
  topCategories: Object.entries(stats.categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({ id, count })),
};

console.log("\n=== DealsHub — Análisis de catálogo ===\n");
console.log(`Productos: ${stats.total} | Calidad global: ${stats.qualityScore}/100\n`);
console.log("Imágenes:", stats.images);
console.log(`  → Reales/útil: ${imgRealPct}% | Placeholder: ${stats.images.placeholder}\n`);
console.log("Precios:", stats.pricing);
console.log(`  → Verificados: ${verifiedPct}% | Orientativos: ${stats.pricing.orientative}\n`);
console.log("Amazon:", stats.amazon, `\n  ASINs en mapa: ${Object.keys(asinMap).length} (${asinPct}%)\n`);
console.log("Metadatos:", stats.metadata);
console.log("\nPor lote:", JSON.stringify(stats.batches, null, 2));
if (stats.recommendations.length) {
  console.log("\nRecomendaciones:");
  stats.recommendations.forEach((r) => console.log(`  • ${r}`));
}

if (writeJson) {
  fs.writeFileSync(path.join(dataDir, "catalog-analysis.json"), JSON.stringify(stats, null, 2) + "\n");
  console.log("\n✓ Guardado data/catalog-analysis.json");
}
