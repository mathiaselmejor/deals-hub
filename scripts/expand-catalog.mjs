#!/usr/bin/env node
/**
 * Expansión automática del catálogo con reglas de transparencia.
 *
 * Uso:
 *   node scripts/expand-catalog.mjs              # mantener + ASINs + verificar
 *   node scripts/expand-catalog.mjs --generate     # crear siguiente lote si falta
 *   CATALOG_TARGET=9000 ASIN_BATCH=200 node scripts/expand-catalog.mjs --generate
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");

const args = new Set(process.argv.slice(2));
const shouldGenerate = args.has("--generate");
const TARGET = Number(process.env.CATALOG_TARGET || 10000);
const ASIN_BATCH = process.env.ASIN_BATCH || "200";
const MIN_BATCH = Number(process.env.CATALOG_MIN_BATCH || 2500);

function run(cmd, label) {
  console.log(`\n▶ ${label}\n   ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit", env: process.env });
}

function countProducts() {
  let total = 0;
  const ids = new Set();
  for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
      for (const p of data.products ?? []) {
        if (!ids.has(p.id)) {
          ids.add(p.id);
          total++;
        }
      }
    } catch {
      /* skip */
    }
  }
  return total;
}

function listBatchFiles() {
  return fs
    .readdirSync(dataDir)
    .filter((f) => /^extra-products-\d+\.json$/.test(f))
    .map((f) => Number(f.match(/\d+/)[0]))
    .sort((a, b) => a - b);
}

function batchProductCount(n) {
  const p = path.join(dataDir, `extra-products-${n}.json`);
  if (!fs.existsSync(p)) return 0;
  return JSON.parse(fs.readFileSync(p, "utf-8")).products?.length ?? 0;
}

function nextBatchNumber() {
  const batches = listBatchFiles();
  if (!batches.length) return 8;
  const latest = batches[batches.length - 1];
  if (!fs.existsSync(path.join(dataDir, `extra-products-${latest}.json`))) return latest;
  if (batchProductCount(latest) >= MIN_BATCH) return latest + 1;
  return latest;
}

function generateBatch(n) {
  const out = path.join(dataDir, `extra-products-${n}.json`);
  if (fs.existsSync(out) && batchProductCount(n) >= MIN_BATCH) {
    console.log(`Lote ${n} ya existe (${batchProductCount(n)} productos)`);
    return false;
  }

  const genSeeds = path.join(__dirname, `_gen-catalog${n}.mjs`);
  const genCatalog = path.join(__dirname, `generate-catalog-${n}.mjs`);
  if (!fs.existsSync(genSeeds) || !fs.existsSync(genCatalog)) {
    console.warn(`No hay generador para lote c${n} — crea scripts/_gen-catalog${n}.mjs`);
    return false;
  }

  run(`node scripts/_gen-catalog${n}.mjs`, `Generar semillas c${n}`);
  run(`node scripts/generate-catalog-${n}.mjs`, `Generar extra-products-${n}.json`);
  return true;
}

function main() {
  const before = countProducts();
  console.log(`Catálogo actual: ~${before} productos únicos | objetivo: ${TARGET}`);

  if (shouldGenerate && before < TARGET) {
    const batch = nextBatchNumber();
    console.log(`Generando lote c${batch}…`);
    generateBatch(batch);
  }

  run("npm run catalog:maintain", "Pipeline catálogo (precios, enlaces, imágenes)");

  if (process.env.SKIP_ASIN !== "1") {
    try {
      run(`python scripts/resolve_all_asins.py ${ASIN_BATCH}`, `Resolver ASINs (lote ${ASIN_BATCH})`);
      run("node scripts/apply-direct-links.mjs", "Aplicar enlaces directos tras ASINs");
      run("node scripts/sync-catalog-pricing.mjs", "Sincronizar precios e imágenes");
      run("node scripts/generate-search-index.mjs", "Regenerar índice búsqueda");
    } catch (e) {
      console.warn("ASIN resolve skipped or failed (Playwright puede no estar en CI):", e.message);
    }
  }

  run("npm run verify-catalog", "Verificar catálogo");

  const after = countProducts();
  console.log(`\n✓ Catálogo: ${before} → ${after} productos`);
  if (after < TARGET) {
    console.log(`  Siguiente paso: node scripts/expand-catalog.mjs --generate (objetivo ${TARGET})`);
  }
}

main();
