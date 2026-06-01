#!/usr/bin/env node
/**
 * Corrige ASINs compartidos entre productos distintos (deja el primario, borra el duplicado para re-resolver).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const mapPath = path.join(dataDir, "direct-asins.json");
const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
delete map._comment;

/** productId que debe conservar el ASIN; el resto se elimina del mapa */
const KEEP_OWNER = {
  B0CY2Z6Q5R: "samsung-galaxy-a55-5g-128gb",
  B0D3F8LQ1H: "google-pixel-8a",
  B0C5QRZ47P: "adidas-ultraboost-24",
  B0D9BMQKM8: "nest-thermostat-termostato-smart",
  B0DP1MRNXM: "oral-b-io-series-9",
  B07W6JF66R: "logitech-mx-keys-s",
  B0DS6D837F: "tp-link-tapo-camara-2k-interior",
  B0BSFRDFK6: "garmin-forerunner-265",
  B0DNNZ2NMF: "levis-501",
  B093R4T9BR: "new-balance-574",
};

const asinToIds = new Map();
for (const [id, val] of Object.entries(map)) {
  const asin = (typeof val === "string" ? val : val?.amazon)?.toUpperCase();
  if (!asin) continue;
  if (!asinToIds.has(asin)) asinToIds.set(asin, []);
  asinToIds.get(asin).push(id);
}

let removed = 0;
for (const [asin, ids] of asinToIds) {
  if (ids.length < 2) continue;
  const keeper = KEEP_OWNER[asin] ?? ids[0];
  for (const id of ids) {
    if (id === keeper) continue;
    delete map[id];
    removed++;
    console.log(`  - ${id} (liberado ASIN ${asin}, conserva ${keeper})`);
  }
}

const out = {
  _comment: "ASIN por producto. Tras colisiones, ejecutar: npm run resolve-asins",
  ...map,
};
fs.writeFileSync(mapPath, JSON.stringify(out, null, 2) + "\n");
console.log(`\n✅ Eliminadas ${removed} entradas conflictivas. Quedan ${Object.keys(map).length} productos.`);
