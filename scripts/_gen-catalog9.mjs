#!/usr/bin/env node
/**
 * Catálogo 9 — complementos, packs y líneas 2025/2026 (c9-).
 * node scripts/_gen-catalog9.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CAT_META, expandNames, loadExistingNames } from "./lib/catalog-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "lib/catalog-9-seeds.mjs");
const dataDir = path.join(__dirname, "../data");

const TARGET_PER_CAT = 36;

const COMPLEMENT_SEEDS = {
  informatica: {
    brands: ["Lenovo", "HP", "Dell", "ASUS", "Acer", "MSI", "Apple", "Samsung"],
    models: ["Cargador USB-C 65W", "Funda rígida 15", "Hub USB-A legacy", "Adaptador Ethernet USB-C", "Webcam cover pack", "Limpiador pantalla kit"],
    variants: ["compatibilidad universal", "65W PD", "100W PD", "negro", "gris espacial", "pack 2", "garantía 24 meses", "marca original"],
  },
  perifericos: {
    brands: ["Logitech", "Razer", "Corsair", "SteelSeries", "HyperX", "Roccat", "ASUS ROG", "Microsoft"],
    models: ["Recambio feet ratón", "Cable paracord USB", "Switch set mecánico", "Lubricante switches", "Tapas side buttons", "Alfombrilla rigida"],
    variants: ["PTFE", "español ISO", "ANSI", "negro", "blanco", "pack 4", "gaming", "ofimática"],
  },
  "componentes-pc": {
    brands: ["Noctua", "be quiet!", "Corsair", "Arctic", "Seasonic", "Fractal", "NZXT", "Cooler Master"],
    models: ["Splitters PWM", "Adaptador 8 a 8 pin", "Soporte SSD M.2", "Brackets radiador 360", "Filtro polvo frontal", "Tornillería caja"],
    variants: ["120mm", "140mm", "ATX", "mATX", "negro", "pack", "Gen5", "PWM"],
  },
  telefonia: {
    brands: ["Apple", "Samsung", "Google", "Xiaomi", "OnePlus", "OPPO", "Honor", "Motorola"],
    models: ["Pack cristal templado", "Cargador pared 45W", "Cable USB-C 2m", "Soporte coche magnético", "Funda antigolpes", "Tarjeta microSD 256"],
    variants: ["iPhone 16 Pro", "Galaxy S25", "Pixel 10", "negro", "transparente", "dual SIM", "5G", "pack ahorro"],
  },
  tablets: {
    brands: ["Apple", "Samsung", "Lenovo", "Microsoft", "Huawei", "Amazon", "Xiaomi", "Honor"],
    models: ["Funda teclado BT", "Cap punta fina", "Protector mate", "Soporte mesa", "Hub USB-C tablet", "Funda niños EVA"],
    variants: ["11 pulgadas", "12 pulgadas", "13 pulgadas", "WiFi", "5G", "rosa", "negro", "pack"],
  },
  gaming: {
    brands: ["Sony", "Microsoft", "Nintendo", "SteelSeries", "Razer", "HyperX", "PowerA", "8BitDo"],
    models: ["Grip silicona mando", "Cable HDMI 8K", "Base carga oficial", "Funda transporte", "Thumbstick caps", "Skin anti-rayado"],
    variants: ["PS5", "Xbox Series", "Switch 2", "PC", "Steam Deck", "negro", "licencia", "pack 2"],
  },
  "tv-audio": {
    brands: ["LG", "Samsung", "Sony", "Sonos", "JBL", "Philips", "TCL", "Hisense"],
    models: ["Barra sonido montaje", "Cable óptico premium", "Adaptador eARC", "Soporte barra", "Antena TDT amplificada", "Regleta 6 tomas"],
    variants: ["55-65", "65-75", "eARC", "Dolby Atmos", "4K120", "2m", "3m", "pack"],
  },
  "foto-video": {
    brands: ["Canon", "Sony", "Fujifilm", "Nikon", "GoPro", "DJI", "SanDisk", "Lexar"],
    models: ["Tarjeta SD V60 256", "Reader USB-C dual", "Correa crossbody", "Funda lluvia", "Filtro UV 67mm", "Kit limpieza lente"],
    variants: ["67mm", "77mm", "82mm", "CFexpress", "SDXC", "profesional", "viaje", "4K"],
  },
  "smart-home": {
    brands: ["Aqara", "Philips Hue", "Ring", "Google Nest", "Amazon", "TP-Link", "Shelly", "Meross"],
    models: ["Sensor humedad", "Bombilla E27 Matter", "Enchufe exterior IP44", "Timbre vídeo", "Hub Zigbee", "Sensor CO2"],
    variants: ["Matter", "Thread", "Zigbee", "WiFi", "exterior", "interior", "pack 2", "blanco"],
  },
  "hogar-cocina": {
    brands: ["Le Creuset", "Tefal", "WMF", "Bra", "Lacor", "Arcos", "Pyrex", "Zojirushi"],
    models: ["Set cuchillos chef", "Tabla cortar bambú", "Molde horno silicona", "Termómetro horno", "Batidor varillas", "Escurridor pasta"],
    variants: ["inox", "antiadherente", "inducción", "set 3", "set 5", "regalo", "chef", "hogar"],
  },
  "pequeno-electro": {
    brands: ["DeLonghi", "Philips", "Bosch", "Dyson", "Rowenta", "Moulinex", "Cecotec", "Krups"],
    models: ["Filtro carbón cafetera", "Recambio cepillo", "Depósito agua", "Base plancha", "Bolsa aspirador", "Mopa repuesto"],
    variants: ["original", "compatible", "pack 4", "serie 5000", "XL", "HEPA", "recambio", "OFERTA"],
  },
  hogar: {
    brands: ["IKEA", "Zara Home", "H&M Home", "Brabantia", "Simplehuman", "Compactor", "Tatay", "Bathco"],
    models: ["Percha madera 10 uds", "Caja organización", "Cortina ducha", "Alfombrilla baño", "Dispensador jabón", "Escobilla WC"],
    variants: ["blanco", "gris", "beige", "40cm", "60cm", "bambú", "reciclado", "pack"],
  },
  "aspiracion-limpieza": {
    brands: ["Dyson", "Roborock", "iRobot", "Kärcher", "Bissell", "Miele", "Vileda", "Leifheit"],
    models: ["Filtro postmotor", "Cepillo turbo", "Mopa repuesto", "Bolsa polvo", "Detergente suelos", "Recambio rodillo"],
    variants: ["original", "compatible", "pack 2", "HEPA", "mascotas", "lavable", "XL", "recambio"],
  },
  climatizacion: {
    brands: ["Daikin", "Mitsubishi", "Samsung", "LG", "DeLonghi", "Cecotec", "Rowenta", "Philips"],
    models: ["Filtro purificador", "Mando universal AC", "Kit ventana", "Difusor aromas", "Sensor temperatura", "Timer enchufe"],
    variants: ["HEPA", "9000 BTU", "12000 BTU", "WiFi", "universal", "silencioso", "pack 2", "carbón"],
  },
  belleza: {
    brands: ["L'Oréal", "Estée Lauder", "Clinique", "MAC", "The Ordinary", "CeraVe", "La Roche-Posay", "Foreo"],
    models: ["Set brochas viaje", "Esponja maquillaje", "Neceser cosmética", "Espejo LED", "Organizador labiales", "Cap secado pelo"],
    variants: ["vegano", "regalo", "travel", "SPF 50", "piel sensible", "profesional", "pack", "edición 2025"],
  },
  "salud-deporte": {
    brands: ["Withings", "Omron", "Garmin", "Fitbit", "Polar", "Theragun", "Compex", "Beurer"],
    models: ["Correa reloj", "Protector pantalla", "Electrodos TENS", "Banda FC pecho", "Rodillo foam", "Banda elasticidad"],
    variants: ["M", "L", "Bluetooth", "recargable", "clínico", "deportivo", "pack 2", "unisex"],
  },
  deportes: {
    brands: ["Nike", "Adidas", "Decathlon", "Asics", "Puma", "Under Armour", "Compressport", "Garmin"],
    models: ["Calcetines running", "Cinturón hidratación", "Guantes gimnasio", "Plantillas running", "Botella 750ml", "Mochila trail"],
    variants: ["talla M", "talla L", "running", "trail", "negro", "reflectante", "pack 3", "unisex"],
  },
  ropa: {
    brands: ["Zara", "Mango", "Uniqlo", "Levi's", "Carhartt", "Patagonia", "Columbia", "The North Face"],
    models: ["Calcetines algodón", "Cinturón piel", "Guantes lana", "Gorro punto", "Bufanda", "Perchas terciopelo"],
    variants: ["talla M", "talla L", "negro", "beige", "unisex", "algodón orgánico", "pack", "AW25"],
  },
  "relojes-accesorios": {
    brands: ["Casio", "Seiko", "Citizen", "Tissot", "Fossil", "Ray-Ban", "Oakley", "Swarovski"],
    models: ["Correa acero", "Correa NATO", "Estuche reloj", "Kit herramientas", "Protector pantalla", "Cargador smartwatch"],
    variants: ["18mm", "20mm", "22mm", "negro", "cuero", "acero", "quick release", "pack"],
  },
  "maletas-viaje": {
    brands: ["Samsonite", "American Tourister", "Rimowa", "Delsey", "Travelon", "Pacsafe", "Level8", "Thule"],
    models: ["Packing cubes 5", "Candado TSA", "Etiqueta equipaje", "Almohada cervical", "Adaptador universal", "Neceser colgante"],
    variants: ["cabina", "S", "M", "L", "antirrobo", "negro", "pack viaje", "reciclado"],
  },
  "piscina-playa": {
    brands: ["Intex", "Bestway", "Speedo", "Arena", "Cressi", "Decathlon", "Zoggs", "Sevylor"],
    models: ["Cloro piscina", "Filtro cartucho", "Toldo playa", "Gafas snorkel", "Chanclas agua", "Bolsa estanca"],
    variants: ["piscina", "playa", "niño", "adulto", "UV50", "pack", "recambio", "verano 2025"],
  },
  jardin: {
    brands: ["Gardena", "Bosch", "Makita", "Fiskars", "Kärcher", "Husqvarna", "Einhell", "Garland"],
    models: ["Manguera 20m", "Pistola riego", "Guantes jardín", "Tijeras poda", "Semillas césped", "Abono universal"],
    variants: ["15m", "30m", "18V", "orgánico", "pack", "eco", "adulto", "profesional"],
  },
  bricolaje: {
    brands: ["Bosch", "DeWalt", "Makita", "Milwaukee", "Stanley", "Knipex", "Wiha", "Würth"],
    models: ["Broca set 15", "Disco corte 10", "Cinta métrica", "Nivel láser", "Guantes trabajo", "Gafas protección"],
    variants: ["HSS", "18V", "profesional", "bricolaje", "pack", "220V", "negro", "amarillo"],
  },
  oficina: {
    brands: ["Fellowes", "Leitz", "3M", "Post-it", "Pilot", "Staedtler", "Moleskine", "Logitech"],
    models: ["Grapas 5000", "Fundas plastificar", "Organizador escritorio", "Reposapiés", "Rotuladores 12", "Archivador palanca"],
    variants: ["A4", "A5", "negro", "reciclado", "pack 5", "oficina", "colores", "profesional"],
  },
  libros: {
    brands: ["Planeta", "Penguin", "Anagrama", "Tusquets", "Alfaguara", "Sexto Piso", "Salamandra", "Debolsillo"],
    models: ["Marcapáginas set", "Luz lectura", "Soporte libro", "Funda eReader", "Cuaderno A5", "Pack clásicos"],
    variants: ["regalo", "español", "A5", "bolsillo", "tapa dura", "audiolibro", "pack 3", "2025"],
  },
  "bebes-ninos": {
    brands: ["Philips Avent", "NUK", "Chicco", "Jané", "Medela", "Tommee Tippee", "MAM", "Suavinex"],
    models: ["Chupete 2 uds", "Biberón anticólico", "Termómetro baño", "Sábana cuna", "Reducidor wc", "Mordedor silicona"],
    variants: ["0-6m", "6-18m", "rosa", "azul", "BPA free", "pack 2", "neutro", "lavable"],
  },
  juguetes: {
    brands: ["LEGO", "Playmobil", "Hasbro", "Mattel", "Ravensburger", "Funko", "Nintendo", "Spin Master"],
    models: ["Caja almacenaje", "Baseplate", "Puzzle 500p", "Pilas recargables", "Organizador piezas", "Estuche cartas"],
    variants: ["6+", "8+", "negro", "pack", "oficial", "compatible", "recargable", "regalo"],
  },
  mascotas: {
    brands: ["Royal Canin", "Purina", "Kong", "Ferplast", "Trixie", "Catit", "Hunter", "Petkit"],
    models: ["Bol plegable", "Cepillo deshedding", "Arena 10L", "Correa extensible", "Fuente filtro", "Transportín"],
    variants: ["perro M", "gato", "pack", "hipoalergénico", "recambio", "viaje", "senior", "cachorro"],
  },
  automovil: {
    brands: ["Michelin", "Bosch", "Garmin", "Nextbase", "Sonax", "Meguiar's", "Thule", "Nilfisk"],
    models: ["Limpiaparabrisas 5L", "Organizador maletero", "Cargador coche 65W", "Soporte móvil", "Kit detailing", "Medidor presión"],
    variants: ["universal", "12V", "USB-C", "negro", "verano", "invierno", "pack", "OBD"],
  },
  movilidad: {
    brands: ["Xiaomi", "Segway", "Ninebot", "ABUS", "Shimano", "Continental", "Cecotec", "Kryptonite"],
    models: ["Candado U", "Luz delantera", "Casco urbano", "Kit parche", "Bomba mini", "Portabotellas"],
    variants: ["M", "L", "negro", "recargable", "bici", "patinete", "antirrobo", "USB"],
  },
  "cafe-te": {
    brands: ["Hario", "Bialetti", "Melitta", "Lavazza", "DeLonghi", "Twinings", "Illy", "Chemex"],
    models: ["Filtros V60 100", "Molinillo manual", "Termo café", "Cápsulas compatibles", "Tetera cristal", "Infusor té"],
    variants: ["V60", "Moka 6", "pack 100", "descafeinado", "orgánico", "regalo", "acero", "cristal"],
  },
  "vinos-gourmet": {
    brands: ["La Chinata", "Brindisa", "Protos", "Marqués de Riscal", "Torres", "Freixenet", "DO Rioja", "DO Ribera"],
    models: ["Sacacorchos", "Enfriador vino", "Copas 2 uds", "Aceite AOVE", "Jamón ibérico", "Cesta regalo"],
    variants: ["regalo", "DOP", "750ml", "ecológico", "pack 3", "DO", "temporada", "gourmet"],
  },
  alimentacion: {
    brands: ["Gullón", "Brillante", "Pascual", "Danone", "Heinz", "Barilla", "Gallo", "Ecocesta"],
    models: ["Pack desayuno", "Legumbres 4 uds", "Aceite oliva 1L", "Pasta integral x4", "Arroz basmati", "Frutos secos 1kg"],
    variants: ["sin gluten", "vegano", "bio", "pack 6", "1kg", "ahorro", "sin lactosa", "alto proteína"],
  },
  manualidades: {
    brands: ["Cricut", "DMC", "Winsor", "Faber-Castell", "Staedtler", "Pilot", "Moleskine", "Brother"],
    models: ["Vinilo HTV 5", "Rotuladores 24", "Lienzo 40x50", "Hilo mouliné", "Cutting mat A3", "Resina epoxi"],
    variants: ["A4", "A3", "pack", "principiante", "pro", "colores", "craft", "español"],
  },
  instrumentos: {
    brands: ["Yamaha", "Fender", "D'Addario", "Ernie Ball", "Boss", "Shure", "Hercules", "K&M"],
    models: ["Cuerdas guitarra", "Púas pack 24", "Correa cuero", "Afinador clip", "Cable jack 3m", "Atril plegable"],
    variants: ["091", "046", "3m", "negro", "natural", "pack", "principiante", "estudio"],
  },
  impresion: {
    brands: ["HP", "Brother", "Canon", "Epson", "Xerox", "Kyocera", "Lexmark", "Dymo"],
    models: ["Toner negro", "Cartucho tricolor", "Papel A4 5000", "Papel foto 100", "Sobres DL", "Etiquetas A4"],
    variants: ["XL", "compatible", "original", "A4", "500 hojas", "pack 2", "oficina", "hogar"],
  },
  colchones: {
    brands: ["Emma", "Simba", "Dormideo", "Pikolin", "Ikea", "Velfont", "Mysleep", "Sonpura"],
    models: ["Almohada visco", "Protector colchón", "Sábanas algodón", "Nórdico invierno", "Topper visco", "Funda nórdica"],
    variants: ["90", "135", "150", "180", "invierno", "verano", "algodón", "pack 2"],
  },
  electronica: {
    brands: ["Anker", "Belkin", "Tile", "Apple", "Samsung", "Google", "Ugreen", "Baseus"],
    models: ["Powerbank 20000", "Cargador GaN 65W", "Cable USB-C pack", "Hub HDMI", "Localizador Tile", "Estación carga 3 en 1"],
    variants: ["USB-C", "65W", "100W", "MagSafe", "GaN", "negro", "blanco", "pack 2"],
  },
};

const existingNames = loadExistingNames(dataDir, fs);
const NAMES = {};
for (const meta of CAT_META) {
  const seeds = COMPLEMENT_SEEDS[meta.id];
  if (!seeds) {
    NAMES[meta.id] = [];
    continue;
  }
  NAMES[meta.id] = expandNames(seeds, existingNames, TARGET_PER_CAT);
}

const totalNames = Object.values(NAMES).reduce((s, a) => s + a.length, 0);
console.log("Total c9 seed names:", totalNames);

const header = `/**
 * Catálogo 9 — complementos y packs (c9-).
 * Generado por scripts/_gen-catalog9.mjs
 */
import { buildCatalogFromNames, CAT_META } from "./catalog-builder.mjs";

export const CATALOG_9_CATEGORIES = [];

const NAMES = ${JSON.stringify(NAMES, null, 2)};

export function buildCatalog9Products(existingNames = new Set()) {
  return buildCatalogFromNames({
    namesByCategory: NAMES,
    meta: CAT_META,
    idPrefix: "c9",
    existingNames,
  });
}
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header, "utf8");

const mod = await import(`file://${OUT.replace(/\\/g, "/")}`);
const prods = mod.buildCatalog9Products(existingNames);
console.log("Products:", prods.length);
console.log("With specs:", prods.filter((p) => p.specs).length);
console.log("Non-transparent:", prods.filter((p) => p.discount > 0 || p.originalPrice > p.price + 0.01).length);
if (prods.length < 1200) {
  console.error("FAIL: need >= 1200 products");
  process.exit(1);
}
