#!/usr/bin/env node
/**
 * Genera catálogo extra con ofertas multi-tienda Awin (ES).
 * Salida: data/extra-products-awin.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildStoreProductUrl } from "./lib/store-urls.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "data", "extra-products-awin.json");

const AWIN_STORES = ["pccomponentes", "fnac", "elcorteingles", "decathlon", "backmarket", "lg"];

function searchOffer(store, name, price, mult = 1) {
  const search = name.split("—")[0].trim();
  return {
    store,
    url: buildStoreProductUrl({ store, search }),
    price: Math.round(price * mult * 100) / 100,
    linkKind: "search",
    priceEstimated: true,
    note: store === "backmarket" ? "Reacondicionado — comisión Awin" : undefined,
  };
}

function amazonOffer(name, price, mult = 1.08) {
  const search = name.split("—")[0].trim();
  return {
    store: "amazon",
    url: buildStoreProductUrl({ store: "amazon", search }),
    price: Math.round(price * mult * 100) / 100,
    linkKind: "search",
    priceEstimated: true,
  };
}

function mediamarktOffer(name, price, mult = 1.05) {
  const search = name.split("—")[0].trim();
  return {
    store: "mediamarkt",
    url: buildStoreProductUrl({ store: "mediamarkt", search }),
    price: Math.round(price * mult * 100) / 100,
    linkKind: "search",
    priceEstimated: true,
    note: "Sin Awin — Tradedoubler pendiente",
  };
}

const CATALOG = [
  { id: "awin-logitech-mx-master-3s", name: "Logitech MX Master 3S", cat: "informatica", price: 89, disc: 15, badge: "Oficina", kw: ["raton", "logitech", "mx master"] },
  { id: "awin-keychron-k2-he", name: "Keychron K2 HE Teclado", cat: "informatica", price: 129, disc: 12, badge: "Gaming", kw: ["teclado", "keychron", "mecanico"] },
  { id: "awin-samsung-odyssey-g5", name: "Samsung Odyssey G5 27\"", cat: "informatica", price: 219, disc: 18, badge: "Monitor", kw: ["monitor", "gaming", "144hz"] },
  { id: "awin-hp-laserjet-pro", name: "HP LaserJet Pro M404", cat: "informatica", price: 189, disc: 10, badge: "Impresora", kw: ["impresora", "hp", "laser"] },
  { id: "awin-lenovo-ideapad-slim", name: "Lenovo IdeaPad Slim 5", cat: "informatica", price: 649, disc: 14, badge: "Portátil", kw: ["portatil", "lenovo", "ideapad"] },
  { id: "awin-asus-rog-strix", name: "ASUS ROG Strix G16", cat: "gaming", price: 1199, disc: 16, badge: "Gaming PC", kw: ["portatil gaming", "asus", "rog"] },
  { id: "awin-msi-monitor-mag", name: "MSI MAG 274UPF 4K", cat: "gaming", price: 399, disc: 20, badge: "4K", kw: ["monitor 4k", "msi", "gaming"] },
  { id: "awin-nvidia-rtx-4070", name: "MSI RTX 4070 Ventus", cat: "informatica", price: 549, disc: 11, badge: "GPU", kw: ["rtx 4070", "grafica", "nvidia"] },
  { id: "awin-amd-ryzen-7-7800x3d", name: "AMD Ryzen 7 7800X3D", cat: "informatica", price: 329, disc: 8, badge: "CPU", kw: ["ryzen", "procesador", "amd"] },
  { id: "awin-samsung-ssd-990-pro", name: "Samsung 990 PRO 1TB NVMe", cat: "informatica", price: 99, disc: 22, badge: "SSD", kw: ["ssd", "nvme", "samsung"] },
  { id: "awin-corsair-vengeance-32gb", name: "Corsair Vengeance DDR5 32GB", cat: "informatica", price: 109, disc: 14, badge: "RAM", kw: ["ram", "ddr5", "corsair"] },
  { id: "awin-jbl-charge-5", name: "JBL Charge 5 Altavoz", cat: "electronica", price: 129, disc: 17, badge: "Audio", kw: ["jbl", "altavoz", "bluetooth"] },
  { id: "awin-sonos-era-100", name: "Sonos Era 100", cat: "electronica", price: 249, disc: 10, badge: "Smart audio", kw: ["sonos", "altavoz", "wifi"] },
  { id: "awin-bose-qc45", name: "Bose QuietComfort 45", cat: "electronica", price: 229, disc: 19, badge: "ANC", kw: ["bose", "auriculares", "cancelacion"] },
  { id: "awin-garmin-forerunner-55", name: "Garmin Forerunner 55", cat: "deportes", price: 149, disc: 13, badge: "Running", kw: ["garmin", "reloj", "running"] },
  { id: "awin-polar-pacer-pro", name: "Polar Pacer Pro", cat: "deportes", price: 279, disc: 15, badge: "Deporte", kw: ["polar", "gps", "reloj"] },
  { id: "awin-nike-pegasus-41", name: "Nike Pegasus 41", cat: "deportes", price: 119, disc: 12, badge: "Running", kw: ["nike", "zapatillas", "running"] },
  { id: "awin-adidas-ultraboost", name: "Adidas Ultraboost Light", cat: "deportes", price: 139, disc: 18, badge: "Boost", kw: ["adidas", "ultraboost", "running"] },
  { id: "awin-decathlon-quechua-mochila", name: "Quechua MH500 Mochila 40L", cat: "deportes", price: 59, disc: 10, badge: "Montaña", kw: ["mochila", "trekking", "decathlon"] },
  { id: "awin-decathlon-bici-elec", name: "Rockrider E-ST 500 E-Bike", cat: "deportes", price: 1299, disc: 8, badge: "E-bike", kw: ["bici electrica", "decathlon", "mtb"] },
  { id: "awin-lg-oled-c4-55", name: "LG OLED C4 55\"", cat: "electronica", price: 1099, disc: 20, badge: "OLED", kw: ["tv oled", "lg", "55 pulgadas"], lgOnly: true },
  { id: "awin-lg-lavadora-ai", name: "LG Lavadora AI Direct Drive 9kg", cat: "hogar", price: 649, disc: 14, badge: "Electro", kw: ["lavadora", "lg", "hogar"], lgOnly: true },
  { id: "awin-backmarket-iphone-13", name: "iPhone 13 Reacondicionado", cat: "electronica", price: 349, disc: 35, badge: "Back Market", kw: ["iphone 13", "reacondicionado", "back market"], bmFocus: true },
  { id: "awin-backmarket-macbook-air", name: "MacBook Air M1 Reacondicionado", cat: "informatica", price: 599, disc: 30, badge: "Premium refurb", kw: ["macbook", "reacondicionado", "apple"], bmFocus: true },
  { id: "awin-backmarket-ipad-9", name: "iPad 9ª gen Reacondicionado", cat: "informatica", price: 219, disc: 28, badge: "Tablet refurb", kw: ["ipad", "reacondicionado"], bmFocus: true },
  { id: "awin-dyson-v12", name: "Dyson V12 Detect Slim", cat: "hogar", price: 449, disc: 16, badge: "Limpieza", kw: ["dyson", "aspirador", "sin cable"] },
  { id: "awin-irobot-roomba-j7", name: "iRobot Roomba j7+", cat: "hogar", price: 599, disc: 22, badge: "Robot", kw: ["roomba", "robot aspirador"] },
  { id: "awin-nespresso-vertuo", name: "Nespresso Vertuo Pop", cat: "hogar-cocina", price: 89, disc: 15, badge: "Café", kw: ["nespresso", "cafetera", "capsulas"] },
  { id: "awin-krups-express", name: "Krups Evidence One", cat: "hogar-cocina", price: 399, disc: 18, badge: "Cafetera", kw: ["krups", "cafetera", "automatica"] },
  { id: "awin-kitchenaid-artisan", name: "KitchenAid Artisan 4.8L", cat: "hogar-cocina", price: 399, disc: 12, badge: "Cocina", kw: ["kitchenaid", "batidora", "amasadora"] },
  { id: "awin-ninja-blender", name: "Ninja Blender Duo", cat: "hogar-cocina", price: 129, disc: 20, badge: "Smoothies", kw: ["ninja", "batidora", "smoothie"] },
  { id: "awin-philips-oneblade", name: "Philips OneBlade Pro", cat: "belleza", price: 49, disc: 14, badge: "Grooming", kw: ["philips", "afeitadora", "oneblade"] },
  { id: "awin-braun-series-9", name: "Braun Series 9 Pro", cat: "belleza", price: 279, disc: 17, badge: "Premium", kw: ["braun", "afeitadora", "series 9"] },
  { id: "awin-oral-b-io9", name: "Oral-B iO Series 9", cat: "belleza", price: 249, disc: 21, badge: "Dental", kw: ["oral b", "cepillo", "dientes"] },
  { id: "awin-fnac-libro-best", name: "Best seller novela — Fnac", cat: "libros", price: 19.9, disc: 10, badge: "Libros", kw: ["libro", "fnac", "novela"], fnacOnly: true },
  { id: "awin-casa-libro-bestseller", name: "Bestseller Casa del Libro", cat: "libros", price: 21.9, disc: 8, badge: "Lectura", kw: ["libro", "casadellibro"], cdlOnly: true },
  { id: "awin-eci-sartenes", name: "Set sartenes antiadherentes ECI", cat: "hogar-cocina", price: 79, disc: 25, badge: "Cocina ECI", kw: ["sartenes", "el corte ingles", "cocina"], eciFocus: true },
  { id: "awin-eci-edredon", name: "Edredón nórdico premium ECI", cat: "hogar", price: 89, disc: 30, badge: "Textil hogar", kw: ["edredon", "cama", "hogar"], eciFocus: true },
  { id: "awin-playstation-5-eci", name: "PlayStation 5 Slim ECI", cat: "gaming", price: 449, disc: 5, badge: "Consola", kw: ["ps5", "playstation", "consola"] },
  { id: "awin-meta-quest-3", name: "Meta Quest 3 128GB", cat: "gaming", price: 549, disc: 8, badge: "VR", kw: ["meta quest", "realidad virtual", "vr"] },
  { id: "awin-steam-deck-oled", name: "Steam Deck OLED 512GB", cat: "gaming", price: 569, disc: 6, badge: "Handheld", kw: ["steam deck", "valve", "portatil gaming"] },
  { id: "awin-gopro-hero-12", name: "GoPro HERO12 Black", cat: "electronica", price: 329, disc: 19, badge: "Action cam", kw: ["gopro", "camara", "deportes"] },
  { id: "awin-dji-mini-4-pro", name: "DJI Mini 4 Pro Fly More", cat: "electronica", price: 899, disc: 10, badge: "Dron", kw: ["dji", "dron", "mini 4 pro"] },
  { id: "awin-fitbit-charge-6", name: "Fitbit Charge 6", cat: "electronica", price: 139, disc: 16, badge: "Fitness", kw: ["fitbit", "pulsera", "salud"] },
  { id: "awin-epson-ecotank", name: "Epson EcoTank L3250", cat: "informatica", price: 199, disc: 14, badge: "Multifunción", kw: ["epson", "ecotank", "impresora"] },
  { id: "awin-brother-hll2350", name: "Brother HL-L2350DW", cat: "informatica", price: 119, disc: 12, badge: "Láser", kw: ["brother", "impresora", "laser"] },
  { id: "awin-tp-link-deco-xe75", name: "TP-Link Deco XE75 WiFi 6E", cat: "informatica", price: 249, disc: 18, badge: "Mesh WiFi", kw: ["tp link", "wifi mesh", "router"] },
  { id: "awin-netgear-orbi", name: "Netgear Orbi RBK752", cat: "informatica", price: 399, disc: 15, badge: "WiFi 6", kw: ["netgear", "orbi", "mesh"] },
  { id: "awin-apple-watch-s9", name: "Apple Watch Series 9 GPS 45mm", cat: "electronica", price: 399, disc: 12, badge: "Smartwatch", kw: ["apple watch", "reloj", "series 9"] },
  { id: "awin-ipad-air-m2", name: "iPad Air M2 11\"", cat: "informatica", price: 649, disc: 9, badge: "Tablet", kw: ["ipad air", "apple", "tablet"] },
  { id: "awin-samsung-galaxy-s24", name: "Samsung Galaxy S24 256GB", cat: "electronica", price: 749, disc: 14, badge: "Smartphone", kw: ["samsung", "galaxy s24", "movil"] },
  { id: "awin-google-pixel-8", name: "Google Pixel 8 Pro", cat: "electronica", price: 799, disc: 16, badge: "Android", kw: ["pixel 8", "google", "android"] },
  { id: "awin-xiaomi-robot-vacuum", name: "Xiaomi Robot Vacuum X20+", cat: "hogar", price: 399, disc: 22, badge: "Robot", kw: ["xiaomi", "robot aspirador", "vacuum"] },
  { id: "awin-taurus-cafetera", name: "Taurus Barista Multicapsule", cat: "hogar-cocina", price: 149, disc: 19, badge: "Café", kw: ["taurus", "cafetera", "capsulas"] },
  { id: "awin-moulinex-air-fryer", name: "Moulinex Easy Fry Mega", cat: "hogar-cocina", price: 129, disc: 24, badge: "Air fryer", kw: ["moulinex", "freidora aire", "air fryer"] },
  { id: "awin-rowenta-aspirador", name: "Rowenta X-Force Flex 14.60", cat: "hogar", price: 349, disc: 18, badge: "Aspirador", kw: ["rowenta", "aspirador", "sin cable"] },
  { id: "awin-columbia-chaqueta", name: "Columbia Chaqueta impermeable", cat: "deportes", price: 89, disc: 28, badge: "Outdoor", kw: ["columbia", "chaqueta", "trekking"] },
  { id: "awin-the-north-face-mochila", name: "The North Face Borealis Mochila", cat: "deportes", price: 79, disc: 15, badge: "Mochila", kw: ["north face", "mochila", "outdoor"] },
  { id: "awin-specialized-helmet", name: "Casco Specialized Align II", cat: "deportes", price: 49, disc: 10, badge: "Ciclismo", kw: ["casco", "ciclismo", "specialized"] },
  { id: "awin-canon-eos-r50", name: "Canon EOS R50 Kit", cat: "electronica", price: 799, disc: 11, badge: "Mirrorless", kw: ["canon", "eos r50", "camara"] },
  { id: "awin-sony-wh1000xm5", name: "Sony WH-1000XM5", cat: "electronica", price: 299, disc: 20, badge: "Premium ANC", kw: ["sony", "wh1000xm5", "auriculares"] },
  { id: "awin-huawei-matepad", name: "Huawei MatePad 11.5\"", cat: "informatica", price: 279, disc: 13, badge: "Tablet", kw: ["huawei", "matepad", "tablet"] },
  { id: "awin-logitech-g502", name: "Logitech G502 X Lightspeed", cat: "gaming", price: 119, disc: 17, badge: "Ratón gaming", kw: ["logitech", "g502", "raton gaming"] },
  { id: "awin-steelseries-apex", name: "SteelSeries Apex Pro TKL", cat: "gaming", price: 189, disc: 14, badge: "Teclado pro", kw: ["steelseries", "teclado", "gaming"] },
  { id: "awin-elden-ring-eci", name: "Elden Ring PS5 — Fnac", cat: "gaming", price: 39.9, disc: 25, badge: "Videojuego", kw: ["elden ring", "ps5", "juego"], fnacOnly: true },
  { id: "awin-harry-potter-cdl", name: "Colección Harry Potter — CDL", cat: "libros", price: 89, disc: 15, badge: "Saga", kw: ["harry potter", "libros", "coleccion"], cdlOnly: true },
  { id: "awin-sapiens-cdl", name: "Sapiens — Yuval Noah Harari", cat: "libros", price: 12.9, disc: 12, badge: "No ficción", kw: ["sapiens", "harari", "libro"], cdlOnly: true },
  { id: "awin-backmarket-galaxy-s22", name: "Samsung Galaxy S22 Reacondicionado", cat: "electronica", price: 279, disc: 32, badge: "Móvil refurb", kw: ["galaxy s22", "reacondicionado", "samsung"], bmFocus: true },
  { id: "awin-lg-frigorifico", name: "LG Frigorífico combi 367L", cat: "hogar", price: 799, disc: 16, badge: "Frigorífico", kw: ["lg", "frigorifico", "electrodomestico"], lgOnly: true },
];

const products = CATALOG.map((item) => {
  const orig = Math.round(item.price / (1 - item.disc / 100) * 100) / 100;
  const offers = [amazonOffer(item.name, item.price, 1.06), mediamarktOffer(item.name, item.price, 1.04)];

  if (item.lgOnly) {
    offers.push(searchOffer("lg", item.name, item.price, 0.98));
  } else if (item.bmFocus) {
    offers.unshift(searchOffer("backmarket", item.name, item.price, 0.92));
    for (const s of ["pccomponentes", "fnac"]) offers.push(searchOffer(s, item.name, item.price, 1.03));
  } else if (item.fnacOnly) {
    offers.push(searchOffer("fnac", item.name, item.price, 0.97));
  } else if (item.cdlOnly) {
    offers.push(searchOffer("casadellibro", item.name, item.price, 0.96));
  } else if (item.eciFocus) {
    offers.unshift(searchOffer("elcorteingles", item.name, item.price, 0.95));
    offers.push(searchOffer("fnac", item.name, item.price, 1.02));
  } else {
    for (const s of AWIN_STORES.filter((x) => x !== "lg" && x !== "backmarket")) {
      offers.push(searchOffer(s, item.name, item.price, 0.97 + Math.random() * 0.08));
    }
    if (item.cat === "deportes") {
      offers.push(searchOffer("decathlon", item.name, item.price, 0.94));
    }
  }

  const prices = offers.map((o) => o.price).filter((p) => p > 0);
  const price = Math.min(...prices);

  return {
    id: item.id,
    name: item.name,
    category: item.cat,
    description: `${item.name} — comparativa en tiendas Awin España (PcComponentes, Fnac, Decathlon, Back Market…).`,
    price,
    originalPrice: orig,
    discount: item.disc,
    rating: 4.3 + Math.round(Math.random() * 6) / 10,
    reviews: Math.floor(500 + Math.random() * 8000),
    badge: item.badge,
    trending: item.disc >= 18,
    featured: item.disc >= 20,
    listingKind: "deal",
    image: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&q=80`,
    offers: offers.sort((a, b) => a.price - b.price),
    videoHook: `¿Dónde comprar ${item.name} más barato?`,
    keywords: item.kw,
  };
});

const data = {
  lastUpdated: new Date().toISOString().slice(0, 10),
  products,
};

fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`✓ ${outFile} — ${products.length} productos Awin`);
