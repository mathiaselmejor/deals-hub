/**
 * Catálogo tiendas afiliadas (sin foco chollo) — listingKind: catalog
 * node scripts/generate-catalog-monetized.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data/catalog-monetized.json");

const IMG = "1498049794561-7780e7231661";

const URLS = {
  amazon: (q) => `https://www.amazon.es/s?k=${encodeURIComponent(q)}`,
  pccomponentes: (q) => `https://www.pccomponentes.com/search/?query=${encodeURIComponent(q)}`,
  mediamarkt: (q) => `https://www.mediamarkt.es/es/search.html?query=${encodeURIComponent(q)}`,
  elcorteingles: (q) => `https://www.elcorteingles.es/search/?s=${encodeURIComponent(q)}`,
  fnac: (q) => `https://www.fnac.es/SearchResult/ResultList.aspx?Search=${encodeURIComponent(q)}`,
  decathlon: (q) => `https://www.decathlon.es/search?query=${encodeURIComponent(q)}`,
  ikea: (q) => `https://www.ikea.com/es/es/search/?q=${encodeURIComponent(q)}`,
  ebay: (q) => `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(q)}`,
};

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 48);
}

function catalogItem([name, category, desc, price, stores]) {
  const search = name.split("—")[0].trim();
  const id = slug(name);
  const offers = stores.map((store, i) => ({
    store,
    url: URLS[store](search),
    price: Math.round(price * (1 + i * 0.04) * 100) / 100,
    condition: "new",
  }));
  offers.sort((a, b) => a.price - b.price);
  return {
    id,
    name,
    category,
    description: desc,
    price: offers[0].price,
    originalPrice: offers[0].price,
    discount: 0,
    rating: 4.5,
    reviews: 3000,
    badge: "Catálogo",
    trending: false,
    listingKind: "catalog",
    image: `https://images.unsplash.com/photo-${IMG}?w=600&h=600&fit=crop`,
    offers,
    videoHook: `Dónde comprar ${search} más barato`,
    keywords: [search.toLowerCase(), category, "comprar", "precio"],
  };
}

const cleanRows = [
  ["Apple AirPods Pro 2 USB-C", "electronica", "Auriculares ANC referencia Apple.", 249, ["amazon", "mediamarkt", "fnac", "pccomponentes"]],
  ["Apple iPad Pro M4 11\"", "tablets", "Tablet profesional chip M4.", 1199, ["amazon", "mediamarkt", "fnac"]],
  ["Samsung Galaxy S24 Ultra", "telefonia", "Flagship Android cámara 200MP.", 1099, ["amazon", "mediamarkt", "pccomponentes"]],
  ["Google Pixel 9 Pro", "telefonia", "IA Gemini y fotografía top.", 999, ["amazon", "mediamarkt", "fnac"]],
  ["Bose QuietComfort Ultra", "tv-audio", "Auriculares ANC premium.", 329, ["amazon", "mediamarkt", "fnac", "elcorteingles"]],
  ["Sony WH-1000XM5", "tv-audio", "Referencia cancelación ruido.", 299, ["amazon", "mediamarkt", "fnac"]],
  ["LG Gram 16 ultraligero", "informatica", "Portátil 16 pulgadas ligero.", 1299, ["amazon", "pccomponentes", "mediamarkt"]],
  ["HP Pavilion Plus 14 OLED", "informatica", "Portátil OLED equilibrado.", 899, ["amazon", "pccomponentes", "mediamarkt"]],
  ["ASUS ROG Zephyrus G14", "informatica", "Gaming portátil potente.", 1799, ["amazon", "pccomponentes", "mediamarkt"]],
  ["MSI Stealth 16 AI Studio", "informatica", "Laptop creator RTX.", 2199, ["amazon", "pccomponentes"]],
  ["Logitech MX Keys S", "perifericos", "Teclado inalámbrico premium.", 109, ["amazon", "pccomponentes", "mediamarkt"]],
  ["Samsung Odyssey G9 49", "informatica", "Monitor ultrawide curvo.", 999, ["amazon", "pccomponentes", "mediamarkt"]],
  ["Philips Hue Play HDMI Sync", "smart-home", "Luces sincronizadas con TV.", 199, ["amazon", "mediamarkt", "fnac"]],
  ["Ring Alarm Pro kit 8 piezas", "smart-home", "Alarma inteligente.", 349, ["amazon", "mediamarkt", "pccomponentes"]],
  ["Tado Termostato V3 Plus", "smart-home", "Ahorro calefacción.", 179, ["amazon", "mediamarkt", "pccomponentes"]],
  ["Dyson V12 Detect Slim", "aspiracion-limpieza", "Aspirador sin cable.", 449, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Miele Complete C3", "aspiracion-limpieza", "Aspirador trineo premium.", 299, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Thermomix TM6", "hogar-cocina", "Robot cocina Vorwerk.", 1279, ["amazon", "elcorteingles"]],
  ["KitchenAid Artisan Mini", "pequeno-electro", "Batidora diseño.", 349, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Smeg tostadora retro", "pequeno-electro", "Estilo años 50.", 169, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Tempur Original almohada", "colchones", "Viscoelástica original.", 149, ["amazon", "elcorteingles"]],
  ["Emma Original colchón 150", "colchones", "Colchón en caja.", 399, ["amazon"]],
  ["Estantería modular 4x4", "hogar", "Organización salón.", 89, ["ikea", "amazon"]],
  ["Cama matrimonio 160 lacada", "hogar", "Dormitorio minimalista.", 199, ["ikea", "amazon"]],
  ["Sábanas algodón 300 hilos", "hogar", "Ropa de cama premium.", 79, ["elcorteingles", "amazon"]],
  ["Dyson Purifier Hot Cool", "climatizacion", "Purifica y climatiza.", 599, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Lavavajillas integrable Serie 6", "lavado-planchado", "Silencioso integrable.", 649, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Horno pirolítico iQ700", "hogar-cocina", "Multifunción premium.", 899, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Adidas Ultraboost 24", "ropa", "Running Boost.", 159, ["amazon", "decathlon", "elcorteingles"]],
  ["Nike Air Max 90", "ropa", "Lifestyle clásica.", 129, ["amazon", "decathlon", "elcorteingles"]],
  ["Plumas Nuptse 700", "ropa", "Abrigo montaña.", 279, ["amazon", "decathlon", "elcorteingles"]],
  ["Forro polar Better Sweater", "ropa", "Outdoor sostenible.", 119, ["amazon", "decathlon"]],
  ["Garmin Fenix 7 Pro", "deportes", "Multisport GPS.", 799, ["amazon", "decathlon", "mediamarkt"]],
  ["Rodillo Wahoo KICKR Core", "deportes", "Ciclismo indoor smart.", 549, ["amazon", "decathlon"]],
  ["Remo Concept2 Model D", "deportes", "Indoor rowing pro.", 1099, ["amazon", "decathlon"]],
  ["Bici híbrida urbana", "deportes", "Movilidad ciudad.", 899, ["decathlon", "amazon"]],
  ["Cofre techo 320 litros", "automovil", "Portaequipajes.", 449, ["amazon", "decathlon", "mediamarkt"]],
  ["GPS TomTom GO Discover 7", "automovil", "Navegación tráfico real.", 249, ["amazon", "mediamarkt", "pccomponentes"]],
  ["LEGO Icons Torre Eiffel", "juguetes", "Coleccionista grande.", 549, ["amazon", "fnac", "elcorteingles"]],
  ["PlayStation Portal", "gaming", "Remote Play PS5.", 219, ["amazon", "mediamarkt", "fnac", "pccomponentes"]],
  ["Teclado Razer BlackWidow V4 Pro", "gaming", "Mecánico gaming.", 229, ["amazon", "pccomponentes", "mediamarkt"]],
  ["Elgato Stream Deck MK2", "perifericos", "Control streaming.", 149, ["amazon", "pccomponentes", "fnac"]],
  ["Canon EOS R6 Mark II body", "foto-video", "Full frame híbrido.", 2299, ["amazon", "fnac", "mediamarkt"]],
  ["Sony A7 IV body", "foto-video", "33MP foto vídeo.", 2399, ["amazon", "fnac", "mediamarkt"]],
  ["DJI Mini 4 Pro Fly More", "drones-rc", "Drone 4K compacto.", 899, ["amazon", "pccomponentes", "mediamarkt"]],
  ["Kindle Scribe 64GB", "tablets", "E-ink con lápiz.", 399, ["amazon", "fnac"]],
  ["Afeitadora Braun Series 9 Pro Plus", "belleza", "Afeitado premium.", 279, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Cepillo Oral-B iO Series 10", "belleza", "Limpieza dental iO.", 299, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Micrófono estudio Neumann TLM 103", "instrumentos", "Condensador vocal.", 999, ["amazon", "fnac"]],
  ["Tarjeta gráfica RTX 4070 Super", "componentes-pc", "GPU 1440p gaming.", 599, ["amazon", "pccomponentes", "mediamarkt"]],
  ["Procesador AMD Ryzen 7 7800X3D", "componentes-pc", "Gaming AM5.", 349, ["amazon", "pccomponentes"]],
  ["Placa base B650 MSI", "componentes-pc", "AM5 DDR5.", 179, ["amazon", "pccomponentes"]],
  ["NAS Synology DS224+", "componentes-pc", "Almacenamiento red 2 bahías.", 399, ["amazon", "pccomponentes"]],
  ["Impresora Brother HL-L2350DW", "impresion", "Láser monocromo WiFi.", 129, ["amazon", "pccomponentes", "mediamarkt"]],
  ["Maleta Samsonite Proxis cabina", "maletas-viaje", "Cabina premium.", 279, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Cafetera Sage Barista Express", "cafe-te", "Espresso manual.", 599, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Pack vino Rioja reserva 6 botellas", "vinos-gourmet", "Selección D.O.Ca.", 54, ["amazon", "elcorteingles"]],
  ["Oxímetro y tensiómetro kit salud", "salud-hogar", "Monitorización hogar.", 59, ["amazon", "mediamarkt"]],
  ["Patinete Xiaomi 4 Pro", "movilidad", "Movilidad urbana.", 449, ["amazon", "mediamarkt", "decathlon"]],
  ["Reloj Apple Watch Ultra 2", "relojes-accesorios", "Outdoor GPS titanium.", 799, ["amazon", "mediamarkt", "fnac"]],
  ["Gafas meta Ray-Ban Wayfarer", "relojes-accesorios", "Smart glasses.", 299, ["amazon", "elcorteingles"]],
  ["Pienso Royal Canin perro 15kg", "mascotas", "Nutrición perro adulto.", 69, ["amazon"]],
  ["Cochecito Uppababy Vista V2", "bebes-ninos", "Sistema paseo premium.", 999, ["amazon", "elcorteingles"]],
  ["Monitor bebé Nanit Pro", "bebes-ninos", "Vídeo HD sueño.", 299, ["amazon", "elcorteingles"]],
  ["Barbacoa Weber Genesis II", "jardin", "Gas 3 quemadores.", 899, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Cortacésped robot Gardena SILENO", "jardin", "Jardín automático.", 899, ["amazon", "mediamarkt"]],
  ["Taladro Makita 18V kit 2 baterías", "bricolaje", "Profesional inalámbrico.", 249, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Silla oficina Herman Miller Aeron", "oficina", "Ergonomía referencia.", 1299, ["amazon", "ikea"]],
  ["Mochila portátil Tumi Alpha 3", "oficina", "Business travel.", 495, ["amazon", "elcorteingles"]],
  ["eBay refurbished iPhone 14 Pro", "telefonia", "Comparar reacondicionados eBay.", 649, ["ebay", "amazon"]],
  ["AliExpress gadgets hogar pack", "smart-home", "Accesorios smart económicos.", 29, ["amazon", "ebay"]],
  ["Booking escapada rural fin de semana", "viajes", "Alojamientos comparados.", 0, ["amazon"]],
  ["PcComponentes montaje PC a medida", "componentes-pc", "Configura tu torre.", 0, ["pccomponentes"]],
  ["Fnac suscripción cultura libros", "libros", "Libros música cine.", 0, ["fnac", "amazon"]],
  ["Decathlon tienda campaña 6 personas", "jardin", "Camping familia.", 129, ["decathlon", "amazon"]],
  ["MediaMarkt TV Samsung QLED 65", "tv-audio", "Televisor smart 65.", 899, ["mediamarkt", "amazon", "pccomponentes"]],
  ["El Corte Inglés electrodomésticos Bosch", "hogar-cocina", "Línea blanca premium.", 0, ["elcorteingles", "amazon"]],
  ["IKEA cocina METOD módulo base", "hogar", "Mueble cocina modular.", 89, ["ikea"]],
  ["Sudadera H&M oversize algodón", "ropa", "Básico moda diaria.", 25, ["amazon", "elcorteingles"]],
  ["Crema anti-edad La Roche-Posay", "belleza", "Dermatológica bestseller.", 32, ["amazon", "elcorteingles", "mediamarkt"]],
  ["Proteína Optimum Nutrition 2.2kg", "alimentacion", "Whey gold standard.", 59, ["amazon", "decathlon"]],
  ["Set cuchillos Wüsthof Classic", "hogar-cocina", "Cuchillería alemana.", 299, ["amazon", "elcorteingles"]],
  ["Aspirador Rowenta X-Force Flex", "aspiracion-limpieza", "Sin cable flexible.", 199, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Freidora Ninja Foodi MAX 9.5L", "hogar-cocina", "Dual zone XL.", 199, ["amazon", "mediamarkt", "elcorteingles"]],
  ["Echo Show 15 pantalla Alexa", "smart-home", "Pantalla hogar conectado.", 249, ["amazon", "mediamarkt"]],
  ["Chromecast con Google TV 4K", "tv-audio", "Streaming 4K.", 39, ["amazon", "mediamarkt", "fnac"]],
  ["Switch 2 reserva lanzamiento", "gaming", "Consola Nintendo nueva gen.", 0, ["amazon", "mediamarkt", "fnac", "pccomponentes"]],
];

const products = cleanRows.map(catalogItem);
const seen = new Set();
for (const p of products) {
  let id = p.id;
  let n = 2;
  while (seen.has(id)) id = `${p.id}-${n++}`;
  p.id = id;
  seen.add(id);
}

fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      lastUpdated: new Date().toISOString().slice(0, 10),
      categories: [],
      products,
    },
    null,
    2,
  ),
);
console.log(`Wrote ${products.length} catalog (monetized) products → ${OUT}`);
