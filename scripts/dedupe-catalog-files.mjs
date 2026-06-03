#!/usr/bin/env node
/** Elimina productos duplicados por id en archivos de menor prioridad. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");

/** Orden de prioridad (el primero que define el id gana; se borra de los demás). */
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
  "catalog-monetized.json",
];

const owners = new Map();

for (const file of FILES) {
  const p = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  let removed = 0;
  const kept = [];
  for (const prod of data.products ?? []) {
    if (owners.has(prod.id)) {
      removed++;
      console.log(`  ${file}: quita ${prod.id} (ya en ${owners.get(prod.id)})`);
      continue;
    }
    owners.set(prod.id, file);
    kept.push(prod);
  }
  if (removed) {
    data.products = kept;
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
    console.log(`✓ ${file}: -${removed}`);
  }
}

console.log(`\nIDs únicos: ${owners.size}`);
