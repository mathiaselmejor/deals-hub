/**
 * Genera data/extra-products-3.json — catálogo ampliado + categorías nuevas.
 * Ejecutar: node scripts/generate-catalog-3.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../data/extra-products-3.json");

const IMG = {
  telefonia: "1511707171634-5ed0d9d2faeb",
  tablets: "1544244015-0df4b3ffc6b0",
  perifericos: "1587825140826-daf39de24e4a",
  foto: "1516035069371-29a1b244cc32",
  climatizacion: "1631545719721-4089b6e5f1a0",
  limpieza: "1558317374-067fb5fbb999",
  bricolaje: "1504143531064-ef691c8a3f1a",
  oficina: "1497366216548-37526070297c",
  libros: "1512820790812-9d5589997378",
  relojes: "1524592094714-0f0654e20314",
  colchones: "1631048887204-6637e4c4a1f4",
  movilidad: "1571068316344-75bc76f77890",
  impresion: "1612815157329-448fe73f0f4d",
  componentes: "1591488320449-011701bb6704",
  musica: "1511379936297-554b3c9499f3",
  manualidades: "1452860600485-3d0c12ef2d88",
  electronica: "1498049794561-7780e7231661",
  gaming: "1542755963-507a5a7583f7",
  hogar: "1556911223-bff31c812dba",
  belleza: "1596462502279-4b4eaa7b7b8b",
  ropa: "1542291026-7eec264c27ff",
  deportes: "1571019614242-c5c5dee9f50e",
  mascotas: "1583511655855-d58739890a07",
  bebes: "1515488042361-ee00e310d9fe",
  juguetes: "1558066620-4b7a87f5dca8",
  automovil: "1492144534657-ae79c964c9d7",
  jardin: "1416879595882-3373a0480b2b",
  alimentacion: "1559056199-641a0ac8b80c",
  informatica: "1517334736513-489689fd1ca8",
  smart: "1558003819-3d1e0e4b8b8b",
};

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

const URLS = {
  amazon: (q) => `https://www.amazon.es/s?k=${encodeURIComponent(q)}`,
  pccomponentes: (q) => `https://www.pccomponentes.com/search/?query=${encodeURIComponent(q)}`,
  mediamarkt: (q) => `https://www.mediamarkt.es/es/search.html?query=${encodeURIComponent(q)}`,
  elcorteingles: (q) => `https://www.elcorteingles.es/search/?s=${encodeURIComponent(q)}`,
  fnac: (q) => `https://www.fnac.es/SearchResult/ResultList.aspx?Search=${encodeURIComponent(q)}`,
  decathlon: (q) => `https://www.decathlon.es/search?query=${encodeURIComponent(q)}`,
  ebay: (q) => `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(q)}`,
  ikea: (q) => `https://www.ikea.com/es/es/search/?q=${encodeURIComponent(q)}`,
};

function offers(search, price, stores) {
  const list = stores.map((store, i) => {
    const bump = i === 0 ? 0 : 0.04 + i * 0.025 + (i % 3) * 0.02;
    return {
      store,
      url: URLS[store](search),
      price: Math.round(price * (1 + bump) * 100) / 100,
    };
  });
  list.sort((a, b) => a.price - b.price);
  return list;
}

function product(row) {
  const [name, category, desc, price, orig, rating, reviews, badge, trending, imgKey, storeList, kw] = row;
  const id = slug(name);
  const search = name.split("—")[0].trim();
  const discount = Math.round((1 - price / orig) * 100);
  const best = offers(search, price, storeList)[0].price;
  return {
    id: id.length > 3 ? id : `${category}-${id}`,
    name,
    category,
    description: desc,
    price: best,
    originalPrice: orig,
    discount,
    rating,
    reviews,
    badge,
    trending: !!trending,
    image: `https://images.unsplash.com/photo-${IMG[imgKey] || IMG.electronica}?w=600&h=600&fit=crop`,
    offers: offers(search, price, storeList),
    videoHook: `¿Merece la pena ${search}? Comparativa de precios`,
    keywords: kw || [search.toLowerCase(), category],
  };
}

const categories = [
  { id: "telefonia", label: "Telefonía", icon: "📱", description: "Smartphones, fundas y accesorios móvil" },
  { id: "tablets", label: "Tablets & eReaders", icon: "📲", description: "Tablets, iPad y lectores electrónicos" },
  { id: "perifericos", label: "Periféricos PC", icon: "🖱️", description: "Teclados, ratones, webcams y micrófonos" },
  { id: "foto-video", label: "Foto & Vídeo", icon: "📷", description: "Cámaras, objetivos y estabilizadores" },
  { id: "climatizacion", label: "Climatización", icon: "❄️", description: "Aire acondicionado, ventiladores y calefacción" },
  { id: "aspiracion-limpieza", label: "Limpieza hogar", icon: "🧹", description: "Aspiradoras, robots y limpieza" },
  { id: "bricolaje", label: "Bricolaje", icon: "🔧", description: "Herramientas, taladros y ferretería" },
  { id: "oficina", label: "Oficina & Papelería", icon: "🖊️", description: "Sillas, escritorios y material escolar" },
  { id: "libros", label: "Libros & Cómics", icon: "📚", description: "Bestsellers, manga y lectura" },
  { id: "relojes-accesorios", label: "Relojes & Joyería", icon: "⌚", description: "Relojes, gafas y accesorios" },
  { id: "colchones", label: "Descanso", icon: "🛏️", description: "Colchones, almohadas y ropa de cama" },
  { id: "movilidad", label: "Movilidad urbana", icon: "🛴", description: "Patinetes, bicis eléctricas y cascos" },
  { id: "impresion", label: "Impresión", icon: "🖨️", description: "Impresoras, tinta y escáneres" },
  { id: "componentes-pc", label: "Componentes PC", icon: "💾", description: "RAM, SSD, GPU y fuentes" },
  { id: "instrumentos", label: "Instrumentos", icon: "🎸", description: "Guitarras, teclados y audio musical" },
  { id: "manualidades", label: "Manualidades", icon: "🎨", description: "Craft, pintura y DIY creativo" },
];

/** [name, category, desc, price, orig, rating, reviews, badge, trending, imgKey, stores, keywords?] */
const rows = [
  // Telefonía
  ["Samsung Galaxy A55 5G — 128GB", "telefonia", "Pantalla Super AMOLED 120Hz y cámara versátil.", 299, 379, 4.6, 8400, "Top ventas", 1, "telefonia", ["amazon", "mediamarkt", "pccomponentes"], ["samsung a55", "movil", "telefonia"]],
  ["Xiaomi Redmi Note 13 Pro 5G", "telefonia", "Gran batería y carga rápida 67W.", 249, 329, 4.5, 12000, "Calidad-precio", 1, "telefonia", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Google Pixel 8a", "telefonia", "Fotografía computacional y Android puro.", 459, 549, 4.7, 3200, "Foto móvil", 1, "telefonia", ["amazon", "mediamarkt", "fnac"]],
  ["iPhone 15 — 128GB", "telefonia", "Dynamic Island y chip A16 Bionic.", 749, 899, 4.8, 15000, "Apple", 1, "telefonia", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Motorola Edge 40 Neo", "telefonia", "Diseño PANTONE y pantalla pOLED 144Hz.", 279, 349, 4.4, 2100, "Diseño", 0, "telefonia", ["amazon", "pccomponentes"]],
  ["OPPO Reno 12 F 5G", "telefonia", "IA en cámara y batería de larga duración.", 299, 399, 4.5, 1800, "Novedad", 1, "telefonia", ["amazon", "mediamarkt"]],
  ["Realme 12 Pro+ 5G", "telefonia", "Zoom periscopio y carga 80W.", 369, 449, 4.5, 2900, "Zoom móvil", 0, "telefonia", ["amazon", "pccomponentes"]],
  ["Nothing Phone (2a)", "telefonia", "Glyph Interface y Android limpio.", 259, 329, 4.4, 5600, "Diferente", 1, "telefonia", ["amazon", "mediamarkt"]],

  // Tablets
  ["iPad 10.9\" (2024) — 64GB WiFi", "tablets", "Tableta versátil para estudio y ocio.", 379, 449, 4.8, 22000, "Tableta #1", 1, "tablets", ["amazon", "mediamarkt", "fnac"]],
  ["Samsung Galaxy Tab S9 FE", "tablets", "S Pen incluido y pantalla LCD 90Hz.", 449, 549, 4.6, 4100, "Con lápiz", 1, "tablets", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Lenovo Tab P12", "tablets", "Pantalla 12.7\" ideal para multimedia.", 279, 349, 4.4, 1200, "Grande", 0, "tablets", ["amazon", "pccomponentes"]],
  ["Amazon Fire HD 10", "tablets", "Entretenimiento Prime Video y lectura.", 109, 159, 4.3, 45000, "Económica", 0, "tablets", ["amazon"]],
  ["Kindle Paperwhite 16GB", "tablets", "Pantalla sin reflejos y semanas de batería.", 139, 169, 4.7, 89000, "Lectura", 1, "tablets", ["amazon", "fnac"]],
  ["Xiaomi Pad 6", "tablets", "Snapdragon 870 y pantalla 2.8K 144Hz.", 299, 399, 4.6, 6800, "Potente", 1, "tablets", ["amazon", "pccomponentes"]],

  // Periféricos
  ["Logitech MX Master 3S", "perifericos", "Ratón ergonómico silencioso para productividad.", 89, 109, 4.8, 14000, "Oficina pro", 1, "perifericos", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Keychron K2 Pro — Teclado mecánico", "perifericos", "Hot-swap y conexión multi-dispositivo.", 99, 129, 4.7, 9200, "Mecánico", 1, "perifericos", ["amazon", "pccomponentes"]],
  ["Razer DeathAdder V3", "perifericos", "Ratón gaming ultraligero 59g.", 69, 89, 4.7, 11000, "Esports", 1, "perifericos", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Logitech C920 HD Pro — Webcam", "perifericos", "La referencia para streaming y teletrabajo.", 69, 89, 4.6, 28000, "Streaming", 0, "perifericos", ["amazon", "pccomponentes"]],
  ["Elgato Wave:3 — Micrófono USB", "perifericos", "Audio broadcast para podcast y Twitch.", 129, 159, 4.7, 5400, "Podcast", 1, "perifericos", ["amazon", "pccomponentes", "fnac"]],
  ["SteelSeries Arctis Nova 7", "perifericos", "Auriculares gaming inalámbricos 2.4GHz.", 159, 199, 4.6, 7600, "Wireless", 1, "perifericos", ["amazon", "pccomponentes", "mediamarkt"]],

  // Foto
  ["Canon EOS R50 — Kit 18-45mm", "foto-video", "Mirrorless APS-C ideal para principiantes.", 699, 849, 4.7, 2100, "Mirrorless", 1, "foto", ["amazon", "fnac", "mediamarkt"]],
  ["Sony ZV-E10 — Vlogging", "foto-video", "Enfocada en creadores de contenido.", 599, 749, 4.6, 3400, "Vlog", 1, "foto", ["amazon", "fnac"]],
  ["DJI Osmo Pocket 3", "foto-video", "Cámara de bolsillo con gimbal 3 ejes.", 519, 599, 4.8, 8900, "Gimbal", 1, "foto", ["amazon", "pccomponentes", "mediamarkt"]],
  ["GoPro HERO12 Black", "foto-video", "Acción 5.3K y estabilización HyperSmooth.", 349, 449, 4.7, 12000, "Acción", 1, "foto", ["amazon", "decathlon", "mediamarkt"]],
  ["Insta360 X4", "foto-video", "Vídeo 360° 8K para redes sociales.", 429, 499, 4.6, 1800, "360°", 0, "foto", ["amazon", "pccomponentes"]],

  // Climatización
  ["Aire acondicionado portátil 3000 frigorías", "climatizacion", "Enfría habitaciones sin obra.", 299, 399, 4.2, 5600, "Verano", 1, "climatizacion", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Dyson Purifier Cool TP07", "climatizacion", "Purifica y ventila con diseño premium.", 449, 549, 4.5, 3200, "Premium", 0, "climatizacion", ["amazon", "elcorteingles", "mediamarkt"]],
  ["Ventilador de torre silencioso Rowenta", "climatizacion", "Oscilación amplia y bajo consumo.", 79, 109, 4.4, 8900, "Silencioso", 1, "climatizacion", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Radiador aceite 9 elementos", "climatizacion", "Calefacción eficiente para invierno.", 89, 119, 4.3, 12000, "Invierno", 0, "climatizacion", ["amazon", "mediamarkt", "ikea"]],
  ["Termoventilador cerámico 2000W", "climatizacion", "Calor rápido para baño u oficina.", 29, 45, 4.2, 22000, "Chollo", 1, "climatizacion", ["amazon", "mediamarkt"]],

  // Limpieza
  ["Roborock Qrevo S — Robot aspirador", "aspiracion-limpieza", "Fregado automático y vaciado inteligente.", 599, 799, 4.7, 4500, "Robot top", 1, "limpieza", ["amazon", "mediamarkt", "pccomponentes"]],
  ["Dyson V15 Detect Absolute", "aspiracion-limpieza", "Laser revela polvo microscópico.", 549, 699, 4.8, 9800, "Sin cable", 1, "limpieza", ["amazon", "elcorteingles", "mediamarkt"]],
  ["Kärcher FC 7 — Fregona eléctrica", "aspiracion-limpieza", "Limpia suelos duros en una pasada.", 249, 329, 4.5, 2100, "Fregado", 0, "limpieza", ["amazon", "mediamarkt"]],
  ["Bissell SpotClean Pro — Tapicería", "aspiracion-limpieza", "Quita manchas de sofás y alfombras.", 179, 229, 4.6, 6700, "Manchas", 0, "limpieza", ["amazon", "elcorteingles"]],
  ["Aspirador ciclónico 700W — Compacto", "aspiracion-limpieza", "Potente y ligero para pisos pequeños.", 59, 89, 4.3, 15000, "Económico", 1, "limpieza", ["amazon", "mediamarkt"]],

  // Bricolaje
  ["Taladro percutor Bosch 18V — Sin batería", "bricolaje", "Profesional, compatible con sistema 18V.", 129, 169, 4.7, 11000, "Bosch", 1, "bricolaje", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Sierra caladora Black+Decker 600W", "bricolaje", "Cortes curvos en madera y metal.", 49, 69, 4.4, 7800, "DIY", 0, "bricolaje", ["amazon", "mediamarkt"]],
  ["Set 120 piezas herramientas", "bricolaje", "Maleta completa para el hogar.", 39, 59, 4.5, 24000, "Kit completo", 1, "bricolaje", ["amazon", "mediamarkt", "ikea"]],
  ["Nivel láser verde 360°", "bricolaje", "Alineación precisa en reformas.", 79, 119, 4.5, 4200, "Láser", 0, "bricolaje", ["amazon", "pccomponentes"]],
  ["Escalera aluminio 3 peldaños plegable", "bricolaje", "Ligera y segura para interiores.", 45, 65, 4.6, 5600, "Hogar", 0, "bricolaje", ["amazon", "ikea", "mediamarkt"]],

  // Oficina
  ["Silla ergonómica oficina — Reposabrazos 4D", "oficina", "Lumbar ajustable para teletrabajo.", 189, 279, 4.4, 8900, "Teletrabajo", 1, "oficina", ["amazon", "ikea", "mediamarkt"]],
  ["Escritorio elevable eléctrico 140cm", "oficina", "Sit-stand para salud postural.", 249, 349, 4.5, 6200, "Standing desk", 1, "oficina", ["amazon", "ikea", "pccomponentes"]],
  ["Monitor arm doble — VESA", "oficina", "Libera espacio en el escritorio.", 49, 79, 4.6, 14000, "Setup", 0, "oficina", ["amazon", "pccomponentes"]],
  ["Mochila antirrobo portátil 15.6\"", "oficina", "USB y compartimento oculto.", 35, 55, 4.5, 18000, "Viaje", 1, "oficina", ["amazon", "fnac", "pccomponentes"]],
  ["Pack bolígrafos Pilot + cuaderno A5", "oficina", "Material escolar y universidad.", 12, 19, 4.7, 3200, "Vuelta al cole", 0, "oficina", ["amazon", "fnac"]],

  // Libros
  ["Kindle Unlimited — 3 meses (tarjeta regalo)", "libros", "Acceso a miles de ebooks y audiolibros.", 23.99, 29.99, 4.5, 500, "Suscripción", 0, "libros", ["amazon"]],
  ["Sapiens — Yuval Noah Harari (tapa blanda)", "libros", "Bestseller de historia de la humanidad.", 14, 22, 4.8, 95000, "Bestseller", 1, "libros", ["amazon", "fnac", "elcorteingles"]],
  ["Manga One Piece — Tomo 1", "libros", "El fenómeno shōnen que arrasa.", 7, 10, 4.9, 12000, "Manga", 1, "libros", ["amazon", "fnac"]],
  ["Harry Potter — Colección 7 libros", "libros", "Edición infantil clásica.", 59, 89, 4.9, 34000, "Regalo", 0, "libros", ["amazon", "fnac", "elcorteingles"]],
  ["Cuaderno Moleskine A5 ruled", "libros", "Icono para notas y bullet journal.", 18, 24, 4.7, 8900, "Premium", 0, "libros", ["amazon", "fnac"]],

  // Relojes
  ["Casio G-Shock GA-2100", "relojes-accesorios", "CasiOak — resistente y tendencia.", 89, 119, 4.8, 22000, "G-Shock", 1, "relojes", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Apple Watch SE (2024) GPS 40mm", "relojes-accesorios", "Salud, fitness y notificaciones.", 249, 299, 4.7, 18000, "Smartwatch", 1, "relojes", ["amazon", "mediamarkt", "fnac"]],
  ["Ray-Ban Meta Wayfarer — Gafas inteligentes", "relojes-accesorios", "Cámara y audio integrados.", 299, 349, 4.3, 900, "Novedad", 1, "relojes", ["amazon", "elcorteingles"]],
  ["Fossil Gen 6 — Wear OS", "relojes-accesorios", "Estilo clásico con Wear OS.", 129, 199, 4.2, 3400, "Elegante", 0, "relojes", ["amazon", "mediamarkt"]],
  ["Gafas polarizadas Oakley Holbrook", "relojes-accesorios", "Protección UV y estilo deportivo.", 119, 159, 4.6, 5600, "Verano", 0, "relojes", ["amazon", "decathlon", "elcorteingles"]],

  // Colchones
  ["Colchón viscoelástico 135x190 — Medio", "colchones", "Adaptación al cuerpo sin hundirse.", 199, 299, 4.4, 12000, "Descanso", 1, "colchones", ["amazon", "ikea", "elcorteingles"]],
  ["Almohada cervical memory foam", "colchones", "Reduce tensión cervical.", 29, 49, 4.5, 28000, "Cervical", 1, "colchones", ["amazon", "ikea"]],
  ["Sábanas microfibra 4 piezas", "colchones", "Suaves, transpirables y fáciles de lavar.", 24, 39, 4.4, 45000, "Hogar", 0, "colchones", ["amazon", "ikea", "elcorteingles"]],
  ["Topper visco 5cm — Refuerzo colchón", "colchones", "Renueva tu colchón sin cambiarlo.", 79, 129, 4.3, 8900, "Upgrade", 0, "colchones", ["amazon", "ikea"]],

  // Movilidad
  ["Xiaomi Electric Scooter 4 Lite", "movilidad", "Patinete urbano 25 km/h homologado.", 349, 449, 4.5, 6700, "Patinete", 1, "movilidad", ["amazon", "mediamarkt", "decathlon"]],
  ["Cascete urbano MIPS — Bicicleta", "movilidad", "Protección certificada para ciudad.", 59, 89, 4.7, 4200, "Seguridad", 1, "movilidad", ["amazon", "decathlon"]],
  ["Candado U-lock acero 16mm", "movilidad", "Antirrobo para bici o patinete.", 25, 39, 4.6, 11000, "Antirrobo", 0, "movilidad", ["amazon", "decathlon"]],
  ["Xiaomi Mi Electric Scooter Pro 2", "movilidad", "Autonomía extendida para desplazamientos.", 449, 549, 4.4, 8900, "Pro", 0, "movilidad", ["amazon", "mediamarkt"]],

  // Impresión
  ["HP LaserJet Pro MFP M234dw", "impresion", "Láser WiFi dúplex para oficina en casa.", 179, 229, 4.5, 7800, "Láser", 1, "impresion", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Epson EcoTank ET-2850", "impresion", "Tinta recargable — coste por página bajo.", 249, 329, 4.6, 5600, "EcoTank", 1, "impresion", ["amazon", "pccomponentes", "fnac"]],
  ["Canon PIXMA G3590 — MegaTank", "impresion", "Impresión color económica en casa.", 199, 269, 4.5, 3200, "Color", 0, "impresion", ["amazon", "pccomponentes"]],
  ["Pack 4 cartuchos HP 305XL compatibles", "impresion", "Recambio económico para HP Deskjet.", 29, 49, 4.3, 15000, "Recambio", 0, "impresion", ["amazon", "pccomponentes"]],

  // Componentes
  ["Samsung 990 Pro 1TB — NVMe PCIe 4.0", "componentes-pc", "SSD top para gaming y edición.", 89, 119, 4.8, 24000, "SSD rápido", 1, "componentes", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Corsair Vengeance DDR5 32GB 6000MHz", "componentes-pc", "Kit RAM para plataformas actuales.", 109, 149, 4.7, 8900, "DDR5", 1, "componentes", ["amazon", "pccomponentes"]],
  ["NVIDIA RTX 4060 Ti 8GB", "componentes-pc", "GPU 1080p/1440p con DLSS 3.", 399, 449, 4.7, 12000, "Gaming GPU", 1, "componentes", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Fuente Corsair RM750e — 80+ Gold", "componentes-pc", "Modular y silenciosa ATX 3.0.", 99, 129, 4.8, 6700, "PSU", 0, "componentes", ["amazon", "pccomponentes"]],
  ["WD Elements 4TB — Disco externo", "componentes-pc", "Backup masivo plug & play.", 89, 109, 4.6, 34000, "Almacenamiento", 1, "componentes", ["amazon", "pccomponentes", "mediamarkt"]],

  // Instrumentos
  ["Yamaha P-45 — Piano digital 88 teclas", "instrumentos", "Ideal para empezar con martillo.", 449, 549, 4.7, 5600, "Piano", 1, "musica", ["amazon", "fnac", "mediamarkt"]],
  ["Fender Squier Stratocaster Pack", "instrumentos", "Pack guitarra eléctrica principiante.", 279, 349, 4.6, 4200, "Guitarra", 1, "musica", ["amazon", "fnac"]],
  ["Audio-Technica AT2020USB+ — Micrófono", "instrumentos", "Grabación vocal y instrumentos en casa.", 119, 149, 4.7, 9800, "Estudio", 0, "musica", ["amazon", "fnac", "pccomponentes"]],
  ["Ukulele soprano con funda", "instrumentos", "Fácil de aprender y muy viral.", 29, 45, 4.5, 12000, "Principiantes", 0, "musica", ["amazon", "fnac"]],

  // Manualidades
  ["Cricut Explore 3 — Plotter de corte", "manualidades", "Personaliza camisetas, pegatinas y más.", 249, 299, 4.6, 3400, "DIY", 1, "manualidades", ["amazon", "fnac", "elcorteingles"]],
  ["Set 120 rotuladores alcohol dual tip", "manualidades", "Lettering y ilustración profesional.", 39, 59, 4.5, 8900, "Arte", 0, "manualidades", ["amazon", "fnac"]],
  ["Resina epoxi transparente 1.5L kit", "manualidades", "Joyas, mesas y decoración.", 35, 55, 4.4, 6700, "Resina", 1, "manualidades", ["amazon"]],
  ["Lego Architecture — Torre Eiffel", "manualidades", "Set coleccionista 10.001 piezas.", 599, 699, 4.9, 2100, "Colección", 0, "manualidades", ["amazon", "fnac", "elcorteingles"]],

  // Refuerzo categorías existentes
  ["PlayStation 5 Slim — Digital Edition", "gaming", "Consola next-gen compacta sin lector.", 449, 499, 4.8, 45000, "PS5", 1, "gaming", ["amazon", "mediamarkt", "pccomponentes", "fnac"]],
  ["Steam Deck OLED 512GB", "gaming", "PC gaming portátil de Valve.", 569, 649, 4.8, 12000, "Portátil PC", 1, "gaming", ["amazon", "pccomponentes"]],
  ["Nintendo Switch OLED", "gaming", "Pantalla OLED y modo híbrido.", 309, 349, 4.8, 62000, "Switch", 1, "gaming", ["amazon", "mediamarkt", "fnac"]],
  ["Xbox Wireless Controller — Carbon Black", "gaming", "Mando oficial compatible PC y Xbox.", 49, 64, 4.7, 28000, "Mando", 0, "gaming", ["amazon", "mediamarkt", "pccomponentes"]],

  ["LG OLED C4 55\" 4K", "tv-audio", "Negros perfectos y HDMI 2.1 para PS5.", 1099, 1399, 4.8, 4200, "OLED", 1, "electronica", ["amazon", "mediamarkt", "pccomponentes", "elcorteingles"]],
  ["Sonos Era 100 — Altavoz inteligente", "tv-audio", "Sonido premium multiroom.", 249, 279, 4.7, 2100, "Sonos", 1, "electronica", ["amazon", "mediamarkt", "fnac"]],
  ["Fire TV Stick 4K Max", "tv-audio", "Streaming 4K con WiFi 6E.", 39, 59, 4.6, 89000, "Streaming", 1, "electronica", ["amazon"]],
  ["Barra sonido Samsung Q990D", "tv-audio", "Dolby Atmos y Q-Symphony con TV Samsung.", 899, 1199, 4.7, 1800, "Atmos", 0, "electronica", ["amazon", "mediamarkt"]],

  ["MacBook Air M3 13\" — 256GB", "informatica", "Ultraligero con autonomía de día.", 1099, 1299, 4.8, 8900, "Apple Silicon", 1, "informatica", ["amazon", "mediamarkt", "pccomponentes", "fnac"]],
  ["Lenovo IdeaPad Slim 5 — Ryzen 7", "informatica", "Portátil equilibrado para trabajo.", 649, 799, 4.5, 3400, "Portátil", 1, "informatica", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Monitor LG UltraGear 27\" 165Hz", "informatica", "IPS 1ms para gaming competitivo.", 199, 279, 4.6, 12000, "Monitor", 1, "informatica", ["amazon", "pccomponentes", "mediamarkt"]],

  ["Nespresso Vertuo Pop — Cafetera", "alimentacion", "Cápsulas de una sola extracción.", 79, 109, 4.5, 18000, "Café", 1, "alimentacion", ["amazon", "elcorteingles", "mediamarkt"]],
  ["Whey Protein 2kg — Chocolate", "alimentacion", "Suplemento fitness alta proteína.", 39, 59, 4.4, 22000, "Fitness", 1, "alimentacion", ["amazon", "decathlon"]],
  ["Robot de cocina Moulinex Cookeo", "hogar-cocina", "Cocina guiada a presión.", 149, 199, 4.6, 8900, "Cocina", 1, "hogar", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Freidora de aire Cosori 5.5L", "hogar-cocina", "Cocina sana con menos aceite.", 89, 119, 4.7, 34000, "Air fryer", 1, "hogar", ["amazon", "mediamarkt"]],

  ["The North Face Borealis — Mochila", "ropa", "Mochila urbana resistente 28L.", 89, 119, 4.7, 14000, "Outdoor", 1, "ropa", ["amazon", "decathlon", "elcorteingles"]],
  ["Levi's 501 Original — Vaquero", "ropa", "Corte clásico vaquero desde 1873.", 69, 99, 4.6, 28000, "Clásico", 0, "ropa", ["amazon", "elcorteingles"]],
  ["Chaqueta softshell impermeable", "ropa", "Capa intermedia trekking y ciudad.", 49, 79, 4.5, 8900, "Outdoor", 1, "ropa", ["amazon", "decathlon"]],

  ["Pelota pádel Head Delta Pro", "deportes", "Usada en circuito profesional.", 89, 119, 4.7, 2100, "Pádel", 1, "deportes", ["amazon", "decathlon"]],
  ["Bicicleta estática magnética", "deportes", "Cardio en casa silencioso.", 199, 299, 4.4, 5600, "Cardio", 0, "deportes", ["amazon", "decathlon", "mediamarkt"]],
  ["Garrafa termo 1L — Running", "deportes", "Hidratación en carrera larga.", 15, 25, 4.6, 12000, "Running", 0, "deportes", ["amazon", "decathlon"]],

  ["Purina Pro Plan gato 3kg", "mascotas", "Pienso premium alto en proteína.", 29, 39, 4.7, 8900, "Gatos", 1, "mascotas", ["amazon"]],
  ["Arnés perro reflective L", "mascotas", "Paseos seguros de noche.", 18, 28, 4.5, 14000, "Perros", 0, "mascotas", ["amazon", "decathlon"]],

  ["Cochecito Bugaboo Butterfly", "bebes-ninos", "Plegado ultra compacto para viajes.", 399, 459, 4.8, 1200, "Viaje bebé", 1, "bebes", ["amazon", "elcorteingles"]],
  ["LEGO Technic Ferrari Daytona SP3", "juguetes", "Set coleccionista 3778 piezas.", 349, 449, 4.9, 5600, "LEGO", 1, "juguetes", ["amazon", "fnac", "elcorteingles"]],
  ["Hot Wheels pista looping", "juguetes", "Circuito clásico para niños.", 29, 45, 4.6, 8900, "Niños", 0, "juguetes", ["amazon", "fnac"]],

  ["Dashcam 4K con GPS y visión nocturna", "automovil", "Graba incidentes y aparca seguro.", 79, 119, 4.5, 12000, "Coche", 1, "automovil", ["amazon", "pccomponentes", "mediamarkt"]],
  ["Aspirador coche 12V potente", "automovil", "Limpia tapicería y maletero.", 29, 45, 4.4, 18000, "Limpieza coche", 0, "automovil", ["amazon", "mediamarkt"]],

  ["Barbacoa Weber Spirit E-310", "jardin", "Gas 3 quemadores para terraza.", 599, 749, 4.7, 3400, "BBQ", 1, "jardin", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Tienda campaña 4 personas", "jardin", "Camping familiar impermeable.", 89, 129, 4.5, 8900, "Camping", 1, "jardin", ["amazon", "decathlon"]],
  ["Robot cortacésped sin cable", "jardin", "Mantiene el césped sin esfuerzo.", 499, 699, 4.4, 1200, "Jardín smart", 0, "jardin", ["amazon", "mediamarkt"]],

  ["Philips Lumea Prestige — IPL", "belleza", "Depilación duradera en casa.", 399, 549, 4.5, 6700, "IPL", 1, "belleza", ["amazon", "mediamarkt", "elcorteingles"]],
  ["Dyson Airwrap Complete Long", "belleza", "Peinado sin calor extremo.", 449, 549, 4.6, 8900, "Premium", 1, "belleza", ["amazon", "elcorteingles"]],
  ["Set skincare coreano 5 pasos", "belleza", "Rutina K-beauty viral en TikTok.", 39, 69, 4.4, 5600, "K-beauty", 1, "belleza", ["amazon"]],

  ["Ring Video Doorbell Pro 2", "smart-home", "Timbre con vídeo HD y detección.", 199, 249, 4.5, 12000, "Seguridad", 1, "smart", ["amazon", "mediamarkt", "pccomponentes"]],
  ["Philips Hue Starter Kit — 3 bombillas", "smart-home", "Iluminación inteligente multicolor.", 99, 129, 4.7, 18000, "Smart light", 1, "smart", ["amazon", "mediamarkt", "ikea"]],
  ["Amazon Echo Pop — Altavoz Alexa", "smart-home", "Control por voz compacto.", 29, 49, 4.5, 34000, "Alexa", 1, "smart", ["amazon"]],

  ["Set pesas kettlebell 8kg + 12kg", "salud-deporte", "Entrenamiento funcional en casa.", 49, 79, 4.6, 6700, "Kettlebell", 0, "deportes", ["amazon", "decathlon"]],
  ["Báscula inteligente Withings Body+", "salud-deporte", "Composición corporal y app.", 79, 99, 4.6, 8900, "Salud", 1, "deportes", ["amazon", "mediamarkt", "fnac"]],
];

const products = rows.map(product);

// IDs únicos
const seen = new Set();
for (const p of products) {
  let id = p.id;
  let n = 2;
  while (seen.has(id)) {
    id = `${p.id}-${n++}`;
  }
  p.id = id;
  seen.add(id);
}

const out = {
  lastUpdated: new Date().toISOString().slice(0, 10),
  categories,
  products,
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
console.log(`Wrote ${products.length} products and ${categories.length} categories to ${OUT}`);
