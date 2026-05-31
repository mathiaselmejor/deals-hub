#!/usr/bin/env node
/**
 * Script para actualizar el catálogo de productos.
 * Uso: npm run update-products
 *
 * En el futuro puedes conectar APIs de ofertas (Amazon Product Advertising,
 * Awin feeds, etc.) — por ahora actualiza lastUpdated y valida el JSON.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const productsPath = join(__dirname, "../data/products.json");

const data = JSON.parse(readFileSync(productsPath, "utf-8"));
data.lastUpdated = new Date().toISOString().split("T")[0];

writeFileSync(productsPath, JSON.stringify(data, null, 2) + "\n");

console.log(`✅ Catálogo actualizado: ${data.lastUpdated}`);
console.log(`   ${data.products.length} productos en ${data.categories.length} categorías`);
console.log("\n💡 Próximos pasos para automatizar:");
console.log("   1. Conectar Amazon Product Advertising API (requiere cuenta afiliado)");
console.log("   2. Importar feeds CSV de Awin");
console.log("   3. Scraping de ofertas (respetando ToS de cada tienda)");
