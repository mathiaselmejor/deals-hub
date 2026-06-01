/**
 * Genera data/extra-products-4.json — segundo lote masivo.
 * node scripts/generate-catalog-4.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../data/extra-products-4.json");

const IMG = {
  viaje: "1553062407-98eeb64c04a8",
  playa: "1507525428034-b723cf961d3c",
  cafe: "1495474473867-173d179c1d51",
  vino: "1510818815521-354f922f6a2b",
  fiesta: "1530103862676-de8c9de5771a",
  salud: "1576091160399-112ba8d25d1f",
  drones: "1473968517373-6ad7c0f4e711",
  cables: "1625728910706-4b4e4f7c4b4b",
  lavado: "1626806819284-82d9c38d6b8b",
  cocina: "1556911223-bff31c812dba",
  textil: "1584100936592-c9463bc2428c",
  electronica: "1498049794561-7780e7231661",
  gaming: "1542755963-507a5a7583f7",
  ropa: "1542291026-7eec264c27ff",
  belleza: "1596462502279-4b4eaa7b7b8b",
  hogar: "1556911223-bff31c812dba",
  deportes: "1571019614242-c5c5dee9f50e",
  mascotas: "1583511655855-d58739890a07",
  jardin: "1416879595882-3373a0480b2b",
  informatica: "1517334736513-489689fd1ca8",
  telefonia: "1511707171634-5ed0d9d2faeb",
  bebes: "1515488042361-ee00e310d9fe",
  juguetes: "1558066620-4b7a87f5dca8",
  automovil: "1492144534657-ae79c964c9d7",
  smart: "1558003819-3d1e0e4b8b8b",
  alimentacion: "1559056199-641a0ac8b80c",
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
  ikea: (q) => `https://www.ikea.com/es/es/search/?q=${encodeURIComponent(q)}`,
  ebay: (q) => `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(q)}`,
};

function offers(search, price, stores) {
  const list = stores.map((store, i) => ({
    store,
    url: URLS[store](search),
    price: Math.round(price * (1 + (i === 0 ? 0 : 0.035 + i * 0.022)) * 100) / 100,
  }));
  list.sort((a, b) => a.price - b.price);
  return list;
}

function product(row) {
  const [name, category, desc, price, orig, rating, reviews, badge, trending, imgKey, storeList, kw] = row;
  const id = slug(name);
  const search = name.split("—")[0].trim();
  const discount = Math.max(0, Math.round((1 - price / orig) * 100));
  const offs = offers(search, price, storeList);
  return {
    id: id.length > 3 ? id : `${category}-${id}`,
    name,
    category,
    description: desc,
    price: offs[0].price,
    originalPrice: orig,
    discount,
    rating,
    reviews,
    badge,
    trending: !!trending,
    image: `https://images.unsplash.com/photo-${IMG[imgKey] || IMG.electronica}?w=600&h=600&fit=crop`,
    offers: offs,
    videoHook: `Comparativa de precios: ${search}`,
    keywords: kw || [search.toLowerCase(), category],
  };
}

/** Genera productos desde plantilla compacta */
function bulk(list, category, descTpl, imgKey, stores, badge = "Oferta") {
  return list.map(([name, price, orig, rating, reviews, trending]) =>
    product([
      name,
      category,
      descTpl(name),
      price,
      orig,
      rating ?? 4.5,
      reviews ?? 5000,
      badge,
      trending ?? 0,
      imgKey,
      stores,
    ]),
  );
}

const categories = [
  { id: "maletas-viaje", label: "Maletas & Viaje", icon: "🧳", description: "Equipaje, mochilas cabina y accesorios de viaje" },
  { id: "piscina-playa", label: "Piscina & Playa", icon: "🏖️", description: "Verano, piscina, toallas y snorkel" },
  { id: "cafe-te", label: "Café & Té", icon: "☕", description: "Cafeteras, molinos y especialidades" },
  { id: "vinos-gourmet", label: "Vinos & Gourmet", icon: "🍷", description: "Vinos, cavas y regalos gourmet" },
  { id: "fiesta-eventos", label: "Fiestas & Eventos", icon: "🎉", description: "Decoración, disfraces y celebraciones" },
  { id: "salud-hogar", label: "Salud en casa", icon: "💊", description: "Tensiómetros, termómetros y bienestar" },
  { id: "drones-rc", label: "Drones & RC", icon: "🚁", description: "Drones, coches RC y accesorios" },
  { id: "cables-cargadores", label: "Cables & Carga", icon: "🔌", description: "Cargadores GaN, hubs USB y cables" },
  { id: "lavado-planchado", label: "Lavado", icon: "🧺", description: "Lavadoras, secadoras y planchas" },
  { id: "pequeno-electro", label: "Pequeño electro", icon: "🍳", description: "Batidoras, tostadoras y exprimidores" },
];

const ST = ["amazon", "mediamarkt", "elcorteingles"];
const ST_PC = ["amazon", "pccomponentes", "mediamarkt"];
const ST_DEC = ["amazon", "decathlon", "mediamarkt"];

const products = [
  ...bulk(
    [
      ["Samsonite S'Cure — Maleta cabina 55cm", 119, 169, 4.6, 8900, 1],
      ["American Tourister Bon Air — Set 2 piezas", 149, 219, 4.5, 12000, 1],
      ["Mochila viaje cabina 40L impermeable", 39, 59, 4.4, 18000, 1],
      ["Neceser viaje colgante organizador", 18, 28, 4.5, 24000, 0],
      ["Candado TSA maleta 4 dígitos", 12, 19, 4.6, 34000, 0],
      ["Almohada cervical viaje memory foam", 22, 35, 4.5, 15000, 1],
      ["Báscula equipaje digital 50kg", 14, 22, 4.4, 8900, 0],
      ["Etiquetas identificación maleta x8", 8, 14, 4.7, 5600, 0],
    ],
    "maletas-viaje",
    (n) => `${n} — ideal para vacaciones y escapadas.`,
    "viaje",
    ST,
  ),
  ...bulk(
    [
      ["Intex piscina desmontable 366x76cm", 89, 129, 4.3, 22000, 1],
      ["Flotador hamaca agua reclinable", 19, 29, 4.5, 45000, 1],
      ["Gafas snorkel máscara panorrámica", 24, 39, 4.4, 12000, 1],
      ["Toalla microfibra playa XL", 15, 25, 4.6, 28000, 0],
      ["Sombrilla playa UV 50+", 29, 45, 4.3, 8900, 0],
      ["Nevera playa 24L isotérmica", 35, 55, 4.4, 6700, 0],
      ["Chaleco flotación niño ajustable", 22, 32, 4.7, 3400, 0],
      ["Protector solar SPF50 200ml pack x2", 18, 28, 4.5, 15000, 1],
    ],
    "piscina-playa",
    (n) => `${n} para disfrutar del verano.`,
    "playa",
    ST_DEC,
  ),
  ...bulk(
    [
      ["De'Longhi Dedica EC685 — Cafetera espresso", 179, 229, 4.6, 14000, 1],
      ["Breville Barista Express — Espresso pro", 549, 699, 4.7, 4200, 1],
      ["Molinillo café eléctrico 18 niveles", 39, 59, 4.5, 8900, 1],
      ["Chemex 6 tazas — Café filtro", 42, 55, 4.8, 5600, 0],
      ["Tetera eléctrica temperatura variable", 49, 69, 4.6, 12000, 1],
      ["Matcha ceremonial 100g orgánico", 24, 34, 4.5, 3200, 0],
      ["Cápsulas compatibles Nespresso x100", 22, 32, 4.4, 45000, 1],
      ["Cold brew maker 1L vidrio", 19, 29, 4.5, 7800, 0],
    ],
    "cafe-te",
    (n) => `${n} — aroma y calidad en casa.`,
    "cafe",
    ST,
  ),
  ...bulk(
    [
      ["Rioja reserva D.O.Ca. 2018 — Caja 6", 54, 78, 4.6, 2100, 0],
      ["Cava brut nature — 3 botellas", 29, 42, 4.5, 4500, 1],
      ["Pack aceite oliva virgen extra 3L", 32, 45, 4.7, 8900, 1],
      ["Cesta regalo gourmet ibérico", 59, 89, 4.6, 3400, 1],
      ["Vino blanco Albariño 2024", 12, 18, 4.5, 1200, 0],
      ["Chocolate Valor surtido 500g", 9, 14, 4.8, 22000, 0],
      ["Salsa trufa negra 100ml", 14, 22, 4.4, 1800, 0],
      ["Set especias mundo 24 frascos", 28, 42, 4.5, 6700, 0],
    ],
    "vinos-gourmet",
    (n) => `${n} — regalo o cena especial.`,
    "vino",
    ["amazon", "elcorteingles"],
  ),
  ...bulk(
    [
      ["Globos helio kit cumpleaños 50u", 15, 25, 4.4, 18000, 1],
      ["Guirnalda LED fiesta 10m", 12, 20, 4.5, 34000, 1],
      ["Máquina humo 400W fiestas", 35, 55, 4.3, 5600, 0],
      ["Disfraces Halloween adulto", 29, 45, 4.2, 8900, 0],
      ["Piñata rellenable unicornio", 18, 28, 4.6, 4200, 0],
      ["Vasos desechables premium 50u", 9, 15, 4.5, 12000, 0],
      ["Photobooth accesorios 30 piezas", 19, 32, 4.4, 7800, 1],
      ["Altavoz Bluetooth fiesta 40W", 49, 79, 4.5, 15000, 1],
    ],
    "fiesta-eventos",
    (n) => `${n} para celebraciones inolvidables.`,
    "fiesta",
    ST,
  ),
  ...bulk(
    [
      ["Omron M3 Comfort — Tensiómetro brazo", 49, 69, 4.7, 28000, 1],
      ["Termómetro infrarrojos sin contacto", 19, 32, 4.5, 45000, 1],
      ["Oxímetro pulso dedo", 15, 25, 4.4, 62000, 1],
      ["Nebulizador compresor adulto/niño", 39, 59, 4.5, 8900, 0],
      ["Almohadilla eléctrica lumbar", 29, 45, 4.4, 12000, 0],
      ["Masajeador cuello Shiatsu", 45, 69, 4.6, 18000, 1],
      ["Tiras reactivas glucosa x50", 22, 35, 4.3, 3400, 0],
      ["Vendas kinesiológicas 6 rollos", 14, 22, 4.6, 15000, 0],
    ],
    "salud-hogar",
    (n) => `${n} — cuidado y bienestar en casa.`,
    "salud",
    ST,
  ),
  ...bulk(
    [
      ["DJI Mini 4 Pro — Drone 4K", 759, 899, 4.8, 3200, 1],
      ["DJI Avata 2 — FPV inmersivo", 999, 1199, 4.7, 890, 1],
      ["Hubsan Zino Mini SE — Drone económico", 299, 399, 4.4, 2100, 1],
      ["Coche teledirigido 1:16 4x4", 45, 69, 4.5, 8900, 0],
      ["Baterías LiPo cargador balanceador", 35, 55, 4.4, 4500, 0],
      ["Gafas FPV beginner", 89, 129, 4.3, 1200, 0],
      ["Helices repuesto DJI Mini pack", 18, 28, 4.6, 5600, 0],
      ["Mochila transporte drone acolchada", 39, 59, 4.5, 3400, 0],
    ],
    "drones-rc",
    (n) => `${n} — foto aérea y diversión RC.`,
    "drones",
    ST_PC,
    "Tech",
  ),
  ...bulk(
    [
      ["Anker 735 GaN — Cargador 65W 3 puertos", 45, 65, 4.8, 34000, 1],
      ["Cable USB-C a Lightning 2m MFi", 12, 19, 4.6, 89000, 1],
      ["Hub USB-C 7 en 1 HDMI 4K", 39, 59, 4.5, 22000, 1],
      ["Base carga inalámbrica MagSafe 15W", 22, 35, 4.5, 45000, 1],
      ["Power bank 20000mAh 65W", 49, 69, 4.6, 28000, 1],
      ["Cable HDMI 2.1 3m 8K", 14, 22, 4.5, 18000, 0],
      ["Adaptador viaje universal", 19, 29, 4.4, 34000, 0],
      ["Organizador cables escritorio", 15, 24, 4.5, 12000, 0],
    ],
    "cables-cargadores",
    (n) => `${n} — carga rápida y conectividad.`,
    "cables",
    ST_PC,
  ),
  ...bulk(
    [
      ["Bosch Serie 4 — Lavadora 8kg 1400rpm", 449, 599, 4.6, 5600, 1],
      ["Secadora bomba calor 8kg A++", 399, 549, 4.5, 3200, 1],
      ["Plancha vapor 3000W cerámica", 49, 79, 4.4, 18000, 1],
      ["Centrifugadora ropa 4.5kg", 89, 129, 4.3, 2100, 0],
      ["Tabla planchar XL con soporte", 35, 55, 4.5, 12000, 0],
      ["Perchas terciopelo 50 unidades", 18, 28, 4.6, 45000, 0],
      ["Bolsa vacío ropa 6u + bomba", 22, 35, 4.4, 8900, 0],
      ["Detergente cápsulas 100 lavados", 19, 29, 4.5, 34000, 0],
    ],
    "lavado-planchado",
    (n) => `${n} — ropa impecable con menos esfuerzo.`,
    "lavado",
    ST,
  ),
  ...bulk(
    [
      ["Vitamix E310 — Batidora vaso pro", 349, 449, 4.8, 4200, 1],
      ["KitchenAid Artisan — Amasadora", 399, 499, 4.8, 8900, 1],
      ["Tostadora 4 ranuras acero", 59, 89, 4.5, 12000, 0],
      ["Exprimidor cítricos 85W", 29, 45, 4.4, 8900, 0],
      ["Sandwichera grill 2000W", 35, 55, 4.5, 15000, 1],
      ["Hervidor agua vidrio LED 1.7L", 32, 49, 4.6, 22000, 0],
      ["Picadora eléctrica 500W", 24, 39, 4.4, 18000, 0],
      ["Bascula cocina digital 5kg", 12, 19, 4.7, 45000, 1],
    ],
    "pequeno-electro",
    (n) => `${n} — electrodomésticos compactos para la cocina.`,
    "cocina",
    ST,
  ),

  // Refuerzo categorías existentes (lotes compactos)
  ...bulk(
    [
      ["Honor Magic6 Lite 5G", 299, 379, 4.5, 4200, 1],
      ["OnePlus Nord CE 4 Lite", 269, 329, 4.4, 6800, 1],
      ["Fairphone 5 — Sostenible", 699, 799, 4.3, 890, 0],
      ["Cargador 67W OnePlus original", 35, 49, 4.6, 12000, 0],
      ["Funda MagSafe transparente iPhone", 14, 22, 4.4, 56000, 1],
      ["Protector pantalla cristal 9H pack 3", 9, 15, 4.5, 89000, 0],
      ["Anillo soporte móvil MagSafe", 12, 19, 4.4, 34000, 1],
      ["Powerbank magnética 5000mAh", 29, 45, 4.5, 18000, 1],
    ],
    "telefonia",
    (n) => `${n} — accesorios y móviles al mejor precio.`,
    "telefonia",
    ST_PC,
  ),
  ...bulk(
    [
      ["ASUS ROG Ally Z1 Extreme", 599, 699, 4.6, 4500, 1],
      ["Meta Quest 3 128GB", 549, 599, 4.7, 12000, 1],
      ["PlayStation VR2", 399, 499, 4.5, 3400, 0],
      ["Silla gaming ergonomica reclinable", 199, 299, 4.4, 8900, 1],
      ["Alfombrilla XXL RGB", 25, 39, 4.5, 22000, 0],
      ["Capturadora Elgato HD60 X", 149, 189, 4.7, 5600, 1],
      ["Volante Logitech G29 + pedales", 249, 299, 4.6, 7800, 1],
      ["Game Pass Ultimate 3 meses", 38, 44, 4.8, 50000, 1],
    ],
    "gaming",
    (n) => `${n} — gaming y realidad virtual.`,
    "gaming",
    ST_PC,
  ),
  ...bulk(
    [
      ["Hisense U8KQ 65\" Mini-LED", 899, 1199, 4.7, 1200, 1],
      ["TCL C845 55\" QD-MiniLED", 649, 849, 4.6, 2100, 1],
      ["Proyector 4K portátil 1000 lúmenes", 399, 549, 4.4, 3400, 1],
      ["Chromecast Google TV 4K", 39, 59, 4.6, 45000, 1],
      ["Apple TV 4K 128GB", 169, 199, 4.8, 8900, 0],
      ["Subwoofer inalámbrico 200W", 129, 179, 4.5, 4200, 0],
      ["Auriculares TV Sennheiser RS", 199, 249, 4.6, 5600, 0],
      ["Soporte TV motorizado 55-75\"", 89, 129, 4.5, 7800, 1],
    ],
    "tv-audio",
    (n) => `${n} — cine en casa y streaming.`,
    "electronica",
    ST,
  ),
  ...bulk(
    [
      ["Acer Aspire 5 — i5 16GB 512GB", 549, 699, 4.4, 5600, 1],
      ["ASUS Vivobook 15 OLED", 699, 849, 4.5, 3400, 1],
      ["Dock Thunderbolt 4 dual 4K", 179, 229, 4.6, 2100, 1],
      ["Webcam 4K autofocus HDR", 89, 119, 4.5, 8900, 0],
      ["Soporte portátil aluminio ajustable", 29, 45, 4.7, 34000, 1],
      ["Mochila portátil antirrobo 17\"", 39, 59, 4.5, 12000, 0],
      ["Teclado Bluetooth compacto", 35, 55, 4.4, 8900, 0],
      ["Raton vertical ergonómico", 45, 65, 4.5, 15000, 1],
    ],
    "informatica",
    (n) => `${n} — productividad y portátiles.`,
    "informatica",
    ST_PC,
  ),
  ...bulk(
    [
      ["Dyson Supersonic — Secador pelo", 329, 429, 4.7, 9800, 1],
      ["GHD Platinum+ — Plancha pelo", 199, 249, 4.6, 6700, 1],
      ["Foreo Luna 4 — Limpieza facial", 169, 199, 4.5, 4200, 1],
      ["Perfume Lancôme La Vie Est Belle", 69, 95, 4.7, 12000, 1],
      ["Maquillaje NYX paleta ojos", 19, 29, 4.5, 28000, 0],
      ["Cepillo dientes Oral-B iO Series 9", 199, 279, 4.7, 8900, 1],
      ["Crema sol facial SPF50 50ml", 16, 24, 4.6, 15000, 0],
      ["Barbero eléctrico Philips 7000", 89, 119, 4.6, 11000, 1],
    ],
    "belleza",
    (n) => `${n} — belleza y cuidado personal.`,
    "belleza",
    ST,
  ),
  ...bulk(
    [
      ["Roomba j7+ — Base autovaciado", 599, 799, 4.6, 4500, 1],
      ["Cafetera superautomática DeLonghi", 449, 599, 4.7, 3200, 1],
      ["Purificador aire HEPA H13", 149, 199, 4.5, 8900, 1],
      ["Cortinas blackout termicas 2u", 39, 59, 4.4, 12000, 0],
      ["Organizador armario 12 cajones", 29, 45, 4.5, 22000, 0],
      ["Espejo LED baño 80cm", 79, 119, 4.4, 5600, 0],
      ["Deshumidificador 20L/día", 199, 279, 4.5, 3400, 1],
      ["Lámpara pie LED regulable", 49, 79, 4.6, 7800, 0],
    ],
    "hogar",
    (n) => `${n} — confort y orden en casa.`,
    "hogar",
    ["amazon", "ikea", "mediamarkt"],
  ),
  ...bulk(
    [
      ["Bicicleta gravel aluminio 28\"", 599, 799, 4.5, 1200, 1],
      ["Casco MTB MIPS integral", 79, 109, 4.7, 4500, 1],
      ["Rodillera voleibol/padel pack 2", 25, 39, 4.5, 8900, 0],
      ["Raqueta pádel Bullpadel Vertex", 149, 199, 4.6, 3400, 1],
      ["Zapatillas running Brooks Ghost", 119, 149, 4.7, 8900, 1],
      ["Chándal Adidas Essentials", 45, 65, 4.5, 22000, 1],
      ["Balón fútbol Champions League", 25, 35, 4.6, 15000, 0],
      ["Gafas natación anti-vaho pack 2", 18, 28, 4.5, 12000, 0],
    ],
    "deportes",
    (n) => `${n} — deporte y outdoor.`,
    "deportes",
    ST_DEC,
  ),
  ...bulk(
    [
      ["Royal Canin Medium Adult 15kg", 59, 79, 4.7, 12000, 1],
      ["Arenero gatos cerrado XL", 45, 65, 4.5, 8900, 1],
      ["Rascador gatos 120cm sisal", 39, 59, 4.6, 15000, 1],
      ["Cama ortopédica perro grande", 49, 75, 4.5, 11000, 1],
      ["Dispensador comida automático", 59, 89, 4.4, 7800, 1],
      ["Transportín homologado IATA", 35, 55, 4.5, 5600, 0],
      ["Juguete interactivo perro IQ", 15, 24, 4.6, 22000, 0],
      ["GPS collar mascotas 4G", 89, 129, 4.3, 2100, 1],
    ],
    "mascotas",
    (n) => `${n} — bienestar para tu mascota.`,
    "mascotas",
    ["amazon"],
  ),
  ...bulk(
    [
      ["Trona evolutiva 3 en 1", 129, 179, 4.5, 5600, 1],
      ["Monitor bebé vídeo WiFi", 89, 129, 4.4, 8900, 1],
      ["Esterilizador biberones UV", 59, 89, 4.6, 6700, 0],
      ["Saco dormir bebé invierno", 35, 55, 4.7, 4200, 0],
      ["Andador actividad musical", 49, 69, 4.5, 7800, 0],
      ["Pañales ecológicos reutilizables 10u", 45, 65, 4.4, 3400, 0],
      ["Mochila portabebés ergonómica", 69, 99, 4.6, 5600, 1],
      ["Bañera plegable con soporte", 39, 59, 4.5, 8900, 0],
    ],
    "bebes-ninos",
    (n) => `${n} — cuidado y paseo del bebé.`,
    "bebes",
    ST,
  ),
  ...bulk(
    [
      ["LEGO Star Wars UCS X-Wing", 239, 299, 4.9, 4500, 1],
      ["Barbie Dreamhouse 2024", 199, 249, 4.6, 3200, 1],
      ["Nerf Elite 2.0 motorizado", 39, 59, 4.5, 12000, 1],
      ["Playmobil pirate ship grande", 89, 119, 4.7, 2100, 0],
      ["Puzzle 1000 piezas arte", 15, 22, 4.6, 18000, 0],
      ["Monopoly edición España", 22, 32, 4.5, 8900, 0],
      ["Peluche gigante 100cm", 29, 45, 4.4, 15000, 1],
      ["Tablet niños 10\" control parental", 99, 139, 4.3, 5600, 1],
    ],
    "juguetes",
    (n) => `${n} — juegos y regalos infantiles.`,
    "juguetes",
    ST,
  ),
  ...bulk(
    [
      ["Compresor aire 12V coche digital", 45, 69, 4.5, 22000, 1],
      ["Arrancador batería 2000A portátil", 89, 129, 4.6, 12000, 1],
      ["Organizador maletero plegable", 25, 39, 4.5, 34000, 0],
      ["Soporte móvil magnético ventilación", 15, 24, 4.4, 56000, 1],
      ["Ambientador coche difusor premium", 12, 19, 4.3, 8900, 0],
      ["Cubreasientos universal neopreno", 35, 55, 4.4, 7800, 0],
      ["Linterna LED coche recargable", 18, 28, 4.6, 15000, 0],
      ["Kit emergencia carretera 65 piezas", 29, 45, 4.5, 11000, 1],
    ],
    "automovil",
    (n) => `${n} — accesorios y seguridad en el coche.`,
    "automovil",
    ST,
  ),
  ...bulk(
    [
      ["Cortacésped eléctrico 32cm", 149, 199, 4.5, 4500, 1],
      ["Manguera extensible 30m + pistola", 29, 45, 4.4, 22000, 0],
      ["Sillón exterior resina trenzada", 199, 299, 4.3, 2100, 0],
      ["Hamaca jardín con soporte", 79, 119, 4.5, 8900, 1],
      ["Semillas césped 2kg premium", 19, 29, 4.4, 3400, 0],
      ["Invernadero mini 4 estantes", 49, 75, 4.3, 1200, 0],
      ["Set herramientas jardín 8 piezas", 35, 55, 4.6, 15000, 0],
      ["Toldo vela sombra 3x4m", 59, 89, 4.4, 5600, 1],
    ],
    "jardin",
    (n) => `${n} — jardín y terraza.`,
    "jardin",
    ["amazon", "ikea", "mediamarkt"],
  ),
  ...bulk(
    [
      ["Nest Thermostat — Termostato smart", 199, 249, 4.6, 3400, 1],
      ["TP-Link Tapo cámara 2K interior", 29, 45, 4.5, 28000, 1],
      ["Cerradura inteligente Bluetooth", 149, 199, 4.4, 5600, 1],
      ["Sensor inundación WiFi 3 pack", 35, 55, 4.5, 4200, 0],
      ["Robot cortacésped Gardena SILENO", 899, 1199, 4.6, 890, 0],
      ["Enchufe inteligente pack 4 Matter", 39, 59, 4.5, 15000, 1],
      ["Google Nest Hub 2 gen 7\"", 79, 99, 4.6, 12000, 1],
      ["Persiana motorizada kit WiFi", 129, 179, 4.3, 2100, 0],
    ],
    "smart-home",
    (n) => `${n} — hogar conectado y seguro.`,
    "smart",
    ST_PC,
  ),
  ...bulk(
    [
      ["Creatina monohidrato 500g", 19, 29, 4.6, 34000, 1],
      ["Barritas proteína caja 12 uds", 22, 32, 4.5, 18000, 1],
      ["Omega 3 1000mg 180 perlas", 18, 28, 4.5, 22000, 0],
      ["Batido sustitutivo comida 14 sobres", 29, 42, 4.4, 8900, 0],
      ["Café grano especial 1kg", 14, 22, 4.7, 12000, 0],
      ["Aceite coco virgen 500ml", 9, 14, 4.5, 15000, 0],
      ["Pack snacks saludables 24 uds", 24, 35, 4.3, 5600, 0],
      ["Té verde matcha latté kit", 32, 45, 4.5, 3400, 0],
    ],
    "alimentacion",
    (n) => `${n} — nutrición y gourmet saludable.`,
    "alimentacion",
    ST,
  ),
  ...bulk(
    [
      ["Chaqueta plumas The North Face 700", 199, 279, 4.7, 5600, 1],
      ["Pantalón cargo wide leg", 39, 59, 4.4, 8900, 1],
      ["Vestido verano midi fluido", 35, 55, 4.5, 12000, 0],
      ["Gafas sol polarizadas Ray-Ban", 89, 129, 4.7, 8900, 1],
      ["Cinturón cuero genuino", 29, 45, 4.5, 15000, 0],
      ["Bufanda lana merino", 25, 39, 4.6, 7800, 0],
      ["Zapatillas New Balance 574", 89, 109, 4.7, 28000, 1],
      ["Sudadera oversize unisex", 29, 45, 4.5, 34000, 1],
    ],
    "ropa",
    (n) => `${n} — moda y complementos.`,
    "ropa",
    ST,
  ),
];

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
    { lastUpdated: new Date().toISOString().slice(0, 10), categories, products },
    null,
    2,
  ),
  "utf8",
);
console.log(`Wrote ${products.length} products, ${categories.length} categories → ${OUT}`);
