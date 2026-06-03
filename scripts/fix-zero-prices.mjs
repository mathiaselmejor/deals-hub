#!/usr/bin/env node
/** Asigna precios mínimos orientativos a productos servicio/viaje con price 0. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const FILES = ["products.json", "extra-products-2.json", "catalog-monetized.json"];

const MIN_PRICES = {
  "hotel-booking": { price: 59, original: 89, note: "Desde — precio por noche orientativo" },
  "expedia-viajes": { price: 129, original: 199, note: "Paquete orientativo" },
  "booking-escapada-rural-fin-de-semana": { price: 79, original: 120, note: "Escapada fin de semana — desde" },
  "pccomponentes-montaje-pc-a-medida": { price: 49, original: 79, note: "Servicio montaje — consultar configuración" },
  "fnac-suscripcion-cultura-libros": { price: 9.99, original: 14.99, note: "Suscripción mensual orientativa" },
  "el-corte-ingles-electrodomesticos-bosch": { price: 399, original: 549, note: "Electrodomésticos Bosch — desde" },
  "switch-2-reserva-lanzamiento": { price: 469, original: 469, note: "Reserva/preventa orientativa" },
};

let fixed = 0;
for (const file of FILES) {
  const p = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  let changed = false;
  for (const prod of data.products ?? []) {
    const patch = MIN_PRICES[prod.id];
    if (!patch || prod.price > 0) continue;
    prod.price = patch.price;
    prod.originalPrice = patch.original;
    prod.discount =
      patch.original > patch.price
        ? Math.round((1 - patch.price / patch.original) * 100)
        : 0;
    for (const o of prod.offers ?? []) {
      if (o.price <= 0) {
        o.price = patch.price;
        o.note = patch.note;
        o.priceEstimated = true;
      }
    }
    fixed++;
    changed = true;
    console.log(`  ${file}: ${prod.id} → ${patch.price}€`);
  }
  if (changed) fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}
console.log(`\n✓ ${fixed} productos con precio mínimo asignado`);
