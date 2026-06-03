/**
 * Generates scripts/lib/catalog-7-seeds.mjs
 * node scripts/_gen-catalog7.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "lib/catalog-7-seeds.mjs");
const dataDir = path.join(__dirname, "../data");

/** Load existing product names from catalog JSON files */
function loadExistingNames() {
  const names = new Set();
  for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const data = JSON.parse(readFileSync(path.join(dataDir, file), "utf-8"));
      for (const p of data.products ?? []) {
        if (p.name) names.add(p.name);
      }
    } catch {
      /* skip */
    }
  }
  return names;
}

const TARGET_PER_CAT = 96;

const CAT_META = [
  { id: "informatica", img: "informatica", stores: "ST_PC" },
  { id: "perifericos", img: "perifericos", stores: "ST_PC" },
  { id: "componentes-pc", img: "componentes", stores: "ST_PC" },
  { id: "telefonia", img: "telefonia", stores: "ST_PC" },
  { id: "tablets", img: "tablets", stores: "ST_PC" },
  { id: "gaming", img: "gaming", stores: "ST_PC" },
  { id: "tv-audio", img: "tvaudio", stores: "ST" },
  { id: "foto-video", img: "foto", stores: "ST_FNAC" },
  { id: "smart-home", img: "smart", stores: "ST_PC" },
  { id: "hogar-cocina", img: "hogarcocina", stores: "ST" },
  { id: "pequeno-electro", img: "pequelectro", stores: "ST" },
  { id: "hogar", img: "hogar", stores: "ST_IKEA" },
  { id: "aspiracion-limpieza", img: "limpieza", stores: "ST" },
  { id: "climatizacion", img: "clima", stores: "ST" },
  { id: "belleza", img: "belleza", stores: "ST" },
  { id: "salud-deporte", img: "salud", stores: "ST_DEC" },
  { id: "deportes", img: "deportes", stores: "ST_DEC" },
  { id: "ropa", img: "ropa", stores: "ST" },
  { id: "relojes-accesorios", img: "relojes", stores: "ST" },
  { id: "maletas-viaje", img: "viaje", stores: "ST" },
  { id: "piscina-playa", img: "playa", stores: "ST_DEC" },
  { id: "jardin", img: "jardin", stores: "ST_IKEA" },
  { id: "bricolaje", img: "bricolaje", stores: "ST" },
  { id: "oficina", img: "oficina", stores: "ST_IKEA" },
  { id: "libros", img: "libros", stores: "ST_BOOK" },
  { id: "bebes-ninos", img: "bebes", stores: "ST" },
  { id: "juguetes", img: "juguetes", stores: "ST_FNAC" },
  { id: "mascotas", img: "mascotas", stores: "ST" },
  { id: "automovil", img: "automovil", stores: "ST" },
  { id: "movilidad", img: "movilidad", stores: "ST_DEC" },
  { id: "cafe-te", img: "cafe", stores: "ST" },
  { id: "vinos-gourmet", img: "vino", stores: "ST" },
  { id: "alimentacion", img: "alimentacion", stores: "ST" },
  { id: "manualidades", img: "manualidades", stores: "ST_FNAC" },
  { id: "instrumentos", img: "musica", stores: "ST_FNAC" },
  { id: "impresion", img: "impresion", stores: "ST_PC" },
  { id: "colchones", img: "colchones", stores: "ST_IKEA" },
  { id: "electronica", img: "electronica", stores: "ST" },
];

/** @type {Record<string, { brands: string[]; models: string[]; variants: string[] }>} */
const SEEDS = {
  informatica: {
    brands: ["Lenovo", "HP", "ASUS", "Acer", "MSI", "Dell", "Huawei", "Samsung", "LG", "Framework", "Gigabyte", "Chuwi"],
    models: [
      "ThinkBook 16 G7", "ProBook 450 G11", "VivoBook S15 OLED", "Aspire 5 A515", "Katana 15 B13",
      "Latitude 5450", "MateBook X Pro 2024", "Galaxy Book5 Pro 360", "Gram 17Z90S", "Laptop 13 AMD",
      "AORUS 16X", "CoreBook X Pro", "IdeaPad Slim 3 15", "Envy x360 15", "Zenbook S 14",
      "Swift X 14", "Prestige 16 AI", "Precision 5680", "MagicBook 16 2024", "Chromebook Plus 514",
    ],
    variants: ["8GB 256GB", "16GB 512GB SSD", "32GB 1TB", "Ryzen 7", "Core Ultra 7", "OLED pantalla", "WiFi 7", "pack Office", "con mochila", "garantía 3 años"],
  },
  perifericos: {
    brands: ["Logitech", "Razer", "Corsair", "SteelSeries", "Keychron", "HyperX", "Roccat", "ASUS ROG", "Microsoft", "Cherry"],
    models: [
      "MX Anywhere 3S", "Basilisk V3 X", "K65 RGB MINI", "Apex 9 TKL", "K8 He",
      "Pulsefire Haste 2", "Kone XP Air", "Falcata Haptics", "Surface Arc Mouse", "MX Mechanical Mini",
      "G502 X Lightspeed", "BlackWidow V4 Pro", "MM700 RGB", "Arctis Nova 1P", "Q6 Max",
      "Cloud Stinger 2", "Vulcan II Max", "Azoth X", "Ergo Keyboard", "MW2950",
    ],
    variants: ["inalámbrico", "español QWERTY", "negro", "blanco", "para Mac", "pack 2 unidades", "con reposamuñecas", "edición España", "USB-C", "Bluetooth"],
  },
  "componentes-pc": {
    brands: ["NVIDIA", "AMD", "Intel", "ASUS", "MSI", "Gigabyte", "Corsair", "Kingston", "Samsung", "WD", "Seagate", "Noctua"],
    models: [
      "GeForce RTX 4080 Super", "Radeon RX 7700 XT", "Core i7-14700F", "TUF B760-PLUS", "PRO Z790-A",
      "AORUS RTX 4060", "Vengeance RGB 48GB", "Fury Renegade 32GB", "990 EVO Plus 2TB", "Black SN770 2TB",
      "Barracuda 4TB", "NH-U12A chromax", "RM1000e", "Focus GX-850", "Torrent Compact",
      "Liquid Freezer II 280", "Dark Rock Pro 5", "Archer T4U Plus", "Sound Blaster Z", "RTX 4070 Ti Super Ventus",
    ],
    variants: ["16GB VRAM", "AM5", "DDR5 6400", "PCIe 4.0", "ATX 3.0", "80+ Gold", "PWM", "kit 2 ventiladores", "OEM", "retail"],
  },
  telefonia: {
    brands: ["Samsung", "Apple", "Google", "Xiaomi", "OnePlus", "OPPO", "Honor", "Motorola", "Nothing", "Realme", "Sony", "Fairphone"],
    models: [
      "Galaxy S24 FE", "iPhone 16e", "Pixel 9a", "14T Pro", "Nord 4",
      "Reno12 Pro", "200 Smart", "Edge 50 Neo", "Phone (3a)", "GT 7 Pro",
      "Xperia 10 VI", "Fairphone 5", "Galaxy Z Flip6", "iPhone 16 Pro Max", "Redmi 14C",
      "12R", "Find N3 Flip", "Magic V2 RSR", "Razr 50 Ultra", "Poco F7",
    ],
    variants: ["128GB", "256GB", "512GB", "5G dual SIM", "libre España", "con funda", "negro", "verde", "blanco", "pack cargador 45W"],
  },
  tablets: {
    brands: ["Apple", "Samsung", "Lenovo", "Xiaomi", "Microsoft", "Huawei", "Amazon", "OnePlus", "Honor", "Google"],
    models: [
      "iPad 11 2025", "Galaxy Tab A9+", "Tab M11", "Redmi Pad Pro 12.1", "Surface Go 4",
      "MatePad 12 X", "Fire Max 11", "Pad 3", "Pad 9", "Pixel Tablet dock",
      "iPad mini 7", "Tab S10 FE", "Tab Plus 12.7", "Pad 7", "Surface Pro 10",
      "MatePad SE 11", "Fire HD 10 Kids", "Pad Neo", "MagicPad 2", "Pixel Slate style",
    ],
    variants: ["WiFi", "WiFi + 5G", "128GB", "256GB", "con lápiz", "con teclado", "funda oficial", "LTE España", "8GB RAM", "12GB RAM"],
  },
  gaming: {
    brands: ["Sony", "Microsoft", "Nintendo", "Valve", "ASUS", "Logitech", "Razer", "SteelSeries", "Secretlab", "Thrustmaster"],
    models: [
      "PS5 Pro", "Xbox Series S 1TB", "Switch 2", "Steam Deck LCD 512GB", "ROG Xbox Ally",
      "G923 Racing", "Viper Mini Signature", "Arctis Nova 7X", "Titan Evo Minecraft", "T248 Ferrari",
      "DualSense Galactic Purple", "Elite Core", "Pro 2", "Dock oficial", "HD60 X Plus",
      "G Pro X Superlight 2", "Kraken V4", "Apex 9 Mini", "Playseat Trophy", "ESWAP X Pro",
    ],
    variants: ["edición digital", "con 2 mandos", "pack juegos", "OLED", "1TB SSD", "español", "licencia UE", "blanco", "negro", "garantía Sony"],
  },
  "tv-audio": {
    brands: ["LG", "Samsung", "Sony", "TCL", "Hisense", "Philips", "Sonos", "Bose", "JBL", "Denon", "Epson", "Panasonic"],
    models: [
      "OLED G5 65", "QN90F 55 Neo QLED", "Bravia 8 II 65", "C755 65", "U7NQ 75",
      "OLED808 55", "Arc Ultra", "Smart Ultra 500", "Bar 800", "AVR-X1800H",
      "EH-LS650", "TX-55MZ800", "Beam Gen 3", "Era 100 SL", "Charge 6",
      "SoundLink Max", "Studio 6", "Flip 7", "Music Frame", "UB820 4K",
    ],
    variants: ["4K 120Hz", "Dolby Atmos", "WiFi", "pack 2 altavoces", "HDMI eARC", "55 pulgadas", "65 pulgadas", "75 pulgadas", "negro", "plateado"],
  },
  "foto-video": {
    brands: ["Canon", "Sony", "Fujifilm", "Nikon", "Panasonic", "GoPro", "DJI", "Sigma", "Tamron", "Rode", "Manfrotto", "Peak Design"],
    models: [
      "EOS R6 Mark II", "Alpha 6700", "X-S20", "Z5 II", "Lumix S5 IIX",
      "HERO13 Black", "Osmo Action 5", "24-70mm F2.8 DG DN", "70-180mm F2.8 G2", "VideoMic GO II",
      "Befree GT XPRO", "Everyday Backpack 30L", "RF 85mm F2 Macro", "FE 20mm F1.8", "XF 56mm F1.2",
      "NIKKOR Z 24-120mm", "12-35mm F2.8", "Media Mod", "Mic 2", "Mini 4 Pro Fly More",
    ],
    variants: ["kit objetivo", "solo cuerpo", "con tarjeta 128GB", "vlogging", "estabilizado", "4K60", "negro", "plateado", "filtro ND incluido", "garantía Canon España"],
  },
  "smart-home": {
    brands: ["Philips Hue", "Aqara", "Ring", "Google Nest", "Amazon", "TP-Link", "Shelly", "Netatmo", "Eve", "Somfy", "Tado", "Reolink"],
    models: [
      "Gradient Lightstrip 75", "Hub M3", "Battery Doorbell Pro", "Thermostat 4th Gen", "Echo Show 15",
      "Tapo C520WS", "Plus 2PM", "Weather Station", "Energy Strip", "Tahoma Switch",
      "Smart Radiator Thermostat X", "Argus PT Ultra", "Play gradient", "FP2 presencia", "Indoor Cam S350",
      "Smart Lock U200", "Guard Plus", "Hub Max", "Smart Plug Mini", "Door View Cam",
    ],
    variants: ["Matter", "Thread", "WiFi", "pack 2", "pack 4", "blanco", "negro", "compatible Alexa", "HomeKit", "instalación España"],
  },
  "hogar-cocina": {
    brands: ["Le Creuset", "Staub", "WMF", "Tefal", "Bra", "Lacor", "Pyrex", "Joseph Joseph", "OXO", "Zojirushi", "KitchenAid", "Magimix"],
    models: [
      "Oval Dutch Oven 29cm", "Cocotte redonda 24", "Fusiontec Wok 28", "Ingenio Unlimited", "Avant Garde sartén",
      "Olla express 6L", "Recipiente hermético 4L", "Index Advance set", "salero giratorio", "NS-ZCC10",
      "Artisan 5.9L", "Cook Expert XL", "Thermomix TM7 rival set", "Mandolina Pro", "batidor varillas",
      "molde horno 30cm", "tabla bambú XL", "escurridor platos", "dispensador aceite", "termo café 1L",
    ],
    variants: ["cerámica", "acero", "antiadherente", "inducción", "rojo", "negro", "set 3 piezas", "apta lavavajillas", "regalo cocina", "edición chef"],
  },
  "pequeno-electro": {
    brands: ["DeLonghi", "Philips", "Braun", "Oral-B", "Dyson", "Rowenta", "Bosch", "Siemens", "Moulinex", "Cecotec", "Russell Hobbs", "Krups"],
    models: [
      "Magnifica Evo", "Series 5400", "Series 9 Pro", "iO Series 10", "Supersonic Nural",
      "X-Force Flex 14.60", "Serie 8 Ovens", "EQ.700", "Companion XL", "Cafelizzia Pro",
      "Colony Brew", "Evidence Plus", "PerfectCare 800", "Airfryer XXL", "Crock-Pot Express",
      "batidora amasadora", "exprimidor lento", "plancha vapor", "centro planchado", "robot cocina Mambo",
    ],
    variants: ["1200W", "1600W", "con molinillo", "automático", "negro", "inox", "pack filtros", "garantía 2 años", "español manual", "eficiencia A+++"],
  },
  hogar: {
    brands: ["IKEA", "Zara Home", "H&M Home", "Maisons du Monde", "La Redoute", "Kave Home", "Westwing", "Roca", "Grohe", "Hansgrohe"],
    models: [
      "MALM cama 160", "BESTÅ salón", "PAX armario 2m", "KALLAX 4x4", "BILLY estantería",
      "Juego mesa comedor", "Sofá modular 3 plazas", "Lámpara arco", "Alfombra yute 200x300", "Cortinas lino",
      "Grifo lavabo Edge", "Raindance Select S", "Talis E", "Espejo baño LED", "Toallero cromo",
      "Perchero entrada", "Cuadro lienzo 80x120", "Cojines velvet pack 4", "Manta sofa lana", "Organizador armario",
    ],
    variants: ["roble", "blanco", "gris antracita", "beige", "120x200", "160x200", "montaje incluido", "online IKEA", "tejido reciclado", "edición limitada"],
  },
  "aspiracion-limpieza": {
    brands: ["Dyson", "Roborock", "iRobot", "Ecovacs", "Bissell", "Kärcher", "Miele", "Bosch", "Rowenta", "Leifheit", "Vileda", "Karcher"],
    models: [
      "V15s Detect Submarine", "S8 MaxV Ultra", "Roomba Combo j9+", "DEEBOT X8 Pro", "CrossWave HydroSteam",
      "FC 7 Cordless", "Triflex HX2", "Unlimited 7", "X-Force 15.60", "Power Cleaner",
      "Ultramax XL", "SC 3 Upright", "Gen5detect", "Qrevo Curv", "Braava jet m6",
      "Aspirador coche 12V", "Fregona microfibra", "Bayeta premium", "Bolsa aspirador", "Filtro HEPA pack",
    ],
    variants: ["con base vaciado", "mopa", "sin cable", "120 min autonomía", "para pelo mascota", "alfombra", "suelo duro", "negro", "blanco", "garantía 3 años"],
  },
  climatizacion: {
    brands: ["Daikin", "Mitsubishi", "Haier", "Samsung", "LG", "DeLonghi", "Cecotec", "Taurus", "Rowenta", "Philips", "Dyson", "Honeywell"],
    models: [
      "Perfera 25", "MSZ-AP25", "Flexis 35", "WindFree 25", "Artcool Mirror",
      "Pinguino PAC N96", "Energy Silk 12000", "Virage VT", "Silence Tech 3.0", "Series 3000i",
      "Purifier Cool TP09", "HCM-350", "Ventilador pedestal", "Calefactor cerámico", "Radiador aceite 11",
      "Deshumidificador 20L", "Purificador HEPA", "Termoventilador baño", "Manta eléctrica", "Control remoto WiFi",
    ],
    variants: ["A+++", "inverter", "WiFi", "bomba calor", "3500 frigorías", "5000 frigorías", "silencioso", "blanco", "gris", "instalación no incluida"],
  },
  belleza: {
    brands: ["L'Oréal", "Estée Lauder", "Clinique", "MAC", "NARS", "Charlotte Tilbury", "The Ordinary", "CeraVe", "La Roche-Posay", "Dyson", "GHD", "Foreo"],
    models: [
      "Revitalift Laser", "Advanced Night Repair", "Moisture Surge 100H", "Studio Fix fluid", "Radiant Creamy Concealer",
      "Pillow Talk set", "Niacinamide 10%", "Moisturizing Cream", "Anthelios UVMune 400", "Airwrap i.d.",
      "Platinum+ styler", "Luna 4", "Parfum Libre YSL", "Good Girl Carolina Herrera", "Aqua di Gio Profondo",
      "Serum vitamina C", "Máscara volumen", "Paleta sombras", "Brocha set Pro", "Aceite limpiador",
    ],
    variants: ["50ml", "30ml", "tono medio", "tono claro", "pack regalo", "vegano", "SPF 50", "piel sensible", "edición España", "travel size"],
  },
  "salud-deporte": {
    brands: ["Withings", "Omron", "Beurer", "Fitbit", "Garmin", "Polar", "Theragun", "Compex", "Salter", "Tanita", "Medisana", "Renpho"],
    models: [
      "Body Scan", "M7 Intelli IT", "BF 720", "Charge 6", "Venu 3S",
      "Ignite 3", "Prime Plus", "Sport Elite 3.0", "Mini", "BC-545N",
      "BM 58", "Smart Scale P2", "Tensiómetro brazo", "Oxímetro dedo", "Báscula cocina",
      "Masajeador cervical", "Rodillera compresión", "Banda resistencia set", "Foam roller", "Botella isotónica 750ml",
    ],
    variants: ["Bluetooth", "WiFi", "recargable", "negro", "blanco", "pack 2", "app iOS Android", "clínico", "deportivo", "garantía UE"],
  },
  deportes: {
    brands: ["Nike", "Adidas", "Puma", "New Balance", "Asics", "Mizuno", "Wilson", "Head", "Speedo", "Arena", "Specialized", "Trek"],
    models: [
      "Pegasus 41", "Ultraboost 5", "Velocity Nitro 3", "Fresh Foam X 1080", "Gel-Nimbus 26",
      "Wave Rider 27", "Pro Staff v14", "Radical MP 2024", "Fastskin LZR", "Powerskin Carbon",
      "Allez Sport", "FX Sport 5", "Chaqueta cortavientos", "Mallas térmicas", "Guantes fitness",
      "Balón fútbol sala", "Raqueta pádel Vertex", "Gafas natación", "Gorro silicona", "Mochila hidratación",
    ],
    variants: ["talla 42", "talla M", "hombre", "mujer", "running", "gimnasio", "negro", "azul", "reflectante", "edición España"],
  },
  ropa: {
    brands: ["Zara", "Mango", "Massimo Dutti", "COS", "Uniqlo", "Scalpers", "Springfield", "Levi's", "Carhartt WIP", "Patagonia", "Columbia", "The North Face"],
    models: [
      "Blazer lino", "Vestido midi satén", "Americana estructura", "Camisa oxford", "Abrigo lana",
      "Jeans 501 original", "Chaqueta Detroit", "Better Sweater", "Powder Lite", "Nuptse 700",
      "Polo piqué", "Pantalón chino", "Jersey cashmere", "Falda plisada", "Parka impermeable",
      "Sudadera oversize", "Camiseta algodón orgánico", "Bermuda lino", "Traje baño", "Bufanda lana merino",
    ],
    variants: ["talla S", "talla M", "talla L", "azul marino", "negro", "beige", "SS25", "AW25", "unisex", "colección España"],
  },
  "relojes-accesorios": {
    brands: ["Casio", "Seiko", "Citizen", "Tissot", "Hamilton", "Fossil", "Ray-Ban", "Oakley", "Pandora", "Swarovski", "MVMT", "Daniel Wellington"],
    models: [
      "G-Shock GA-B2100", "Prospex SPB143", "Promaster Sky", "PRX Powermatic 80", "Khaki Field Murph",
      "Gen 7 Hybrid", "Aviator Classic", "Holbrook Meta", "Charm pulsera", "Attract Trilogy",
      "Chrono minimal", "Classic Cornwall", "Reloj digital vintage", "Gafas sol polarizadas", "Cinturón piel",
      "Cartera RFID", "Pulsera acero", "Anillo plata", "Collar perlas", "Broche vintage",
    ],
    variants: ["correa acero", "correa cuero", "42mm", "40mm", "negro", "plateado", "dorado", "regalo", "caja original", "garantía 2 años"],
  },
  "maletas-viaje": {
    brands: ["Samsonite", "American Tourister", "Rimowa", "Delsey", "Roncato", "Eastpak", "Thule", "Victorinox", "Tumi", "Level8", "Antler", "Travelpro"],
    models: [
      "S'Cure 75cm", "Soundbox 68", "Essential Lite Cabin", "Air France 55", "Zodiac Light",
      "Padded Pak'r", "Subterra 34L", "Spectra 3.0", "Alpha Bravo", "Pegasus 24",
      "Slimline Cabin", "Maxlite 5", "Mochila portátil", "Neceser colgante", "Organizador cables",
      "Candado TSA", "Etiqueta equipaje", "Funda impermeable", "Almohada cervical", "Adaptador universal",
    ],
    variants: ["cabina 55cm", "mediana 68cm", "grande 75cm", "4 ruedas", "expansible", "negro", "azul", "set 3 piezas", "ligera", "garantía 10 años"],
  },
  "piscina-playa": {
    brands: ["Intex", "Bestway", "Speedo", "Arena", "Cressi", "O'Neill", "Quiksilver", "Roxy", "Sevylor", "Zoggs", "Decathlon", "Coleman"],
    models: [
      "Piscina desmontable 366", "Lay-Z-Spa Hawaii", "Hydrospeed 2", "Cobra Ultra Mirror", "Palau shorty",
      "Reactor 3/2", "Hyperfreak 2/2", "Salty Dayz", "Kayak Explorer", "Predator Flex",
      "Gafas adulto", "Aletas training", "Flotador bebé", "Sombrilla playa", "Silla plegable",
      "Nevera playa", "Toalla microfibra XL", "Gorro lycra", "Chaleco snorkel", "Boya open water",
    ],
    variants: ["4.57m", "6 personas", "talla M", "UV 50", "azul", "rosa", "pack familia", "salada", "dulce", "temporada 2025"],
  },
  jardin: {
    brands: ["Gardena", "Husqvarna", "Bosch", "Makita", "Fiskars", "Kärcher", "Einhell", "Stihl", "Weber", "Char-Broil", "Keter", "Biohort"],
    models: [
      "Sileno minimo 500", "Automower 305", "Rotak 37", "DUR181Z cortabordes", "Xact división",
      "Full Control", "GE-CM 36", "FSA 57", "Spirit E-310", "Professional 4",
      "Store It Out", "HighBoard", "Manguera 25m", "Pulverizador 5L", "Tijeras poda bypass",
      "Rastrillo hojas", "Saco compost", "Maceta terracota 40", "Sustrato universal 50L", "Césped artificial rollo",
    ],
    variants: ["18V", "36V", "robot", "gas", "eléctrico", "inox", "verde", "negro", "pack accesorios", "garantía 3 años"],
  },
  bricolaje: {
    brands: ["Bosch", "DeWalt", "Makita", "Milwaukee", "Stanley", "Würth", "Festool", "Metabo", "Ryobi", "Black+Decker", "Knipex", "Wiha"],
    models: [
      "GSB 18V-55", "DCD796", "DHP486", "M18 FUEL", "FatMax nivel láser",
      "Jigsaw GST 150", "TS 55 REB", "SB 18 LTX", "ONE+ taladro", "B+D Matrix",
      "Alicates cobo", "Destornillador precisión", "Caja herramientas", "Broca HSS set", "Sierra calar",
      "Lijadora orbital", "Compresor 24L", "Soldador MIG", "Casco protección", "Guantes anticorte",
    ],
    variants: ["18V", "sin escobillas", "2 baterías", "maletín", "profesional", "bricolaje", "220V", "pack 50 piezas", "made in EU", "manual español"],
  },
  oficina: {
    brands: ["IKEA", "Herman Miller", "Steelcase", "Flexispot", "Fellowes", "Philips", "BenQ", "Epson", "Canon", "Logitech", "3M", "Leitz"],
    models: [
      "MARKUS silla", "Aeron Size B", "Series 1", "E7 Pro standing", "Lotus DX",
      "ScreenBar Halo", "GW2790", "EcoTank ET-4850", "imagePROGRAF", "MeetUp 2",
      "Post-it Super Sticky", "Leitz WOW archivador", "Bandeja apilable", "Organizador escritorio", "Reposapiés ergonómico",
      "Alfombrilla escritorio XL", "Soporte monitor dual", "Lámpara escritorio", "Pizarra magnética", "Destructora partículas",
    ],
    variants: ["negro", "gris", "regulable", "ergonómico", "A3", "A4", "WiFi", "USB-C", "pack 5", "oficina España"],
  },
  libros: {
    brands: ["Planeta", "Penguin Random House", "Anagrama", "Tusquets", "Alfaguara", "Sexto Piso", "Norma", "Salamandra", "Debolsillo", "Blackie Books"],
    models: [
      "Sapiens edición ilustrada", "Cien años soledad tapa dura", "Rayuela", "La sombra del viento", "1984 Orwell",
      "El nombre del viento", "Dune completa", "Harry Potter colección", "El principito lujo", "Kafka en la orilla",
      "Meditaciones Marco Aurelio", "Atomic Habits español", "Sapiencia financiera", "Cocina Ferran Adrià", "Atlas mundial National Geographic",
      "Diccionario RAE", "Manga One Piece 1-10", "Cómic Mortadelo", "Audiolibro Kindle", "Guía Camino Santiago",
    ],
    variants: ["tapa blanda", "tapa dura", "bolsillo", "edición 2025", "firmado", "coleccionista", "eBook", "audiolibro", "español", "envío 24h"],
  },
  "bebes-ninos": {
    brands: ["Bugaboo", "Stokke", "Cybex", "Maxi-Cosi", "Chicco", "Jané", "Inglesina", "Philips Avent", "NUK", "Medela", "Tommee Tippee", "Ergobaby"],
    models: [
      "Fox 5", "YOYO3", "Priam", "Pebble 360", "Perfect Moments",
      "Muum", "Trilogy", "Natural bottle", "Space pacifier", "Swing Maxi",
      "Closer to Nature", "Omni Deluxe", "Silla coche i-Size", "Cuna colecho", "Monitor vídeo",
      "Bañera plegable", "Termómetro digital", "Esterilizador", "Mochila porteo", "Alfombra juego",
    ],
    variants: ["0-15 kg", "i-Size", "negro", "gris", "rosa", "azul", "recién nacido", "pack ahorro", "homologado UE", "manual español"],
  },
  juguetes: {
    brands: ["LEGO", "Playmobil", "Mattel", "Hasbro", "Ravensburger", "Funko", "Bandai", "Spin Master", "VTech", "Clementoni", "Nintendo", "Barbie"],
    models: [
      "Icons Eiffel", "City Hospital", "Advent Calendar", "Barbie Dreamhouse", "Monopoly España",
      "Puzzle 2000 piezas", "Pop Marvel", "Tamagotchi Uni", "Paw Patrol HQ", "Science Kit",
      "Switch juego Mario", "Hot Wheels pista", "Nerf Elite", "Play-Doh kitchen", "Oculus accesorio",
      "Peluche Squishmallow", "Mesa air hockey", "Dron niños", "Robot programable", "Juego mesa Catan",
    ],
    variants: ["6+", "8+", "12+", "edición 2025", "español", "baterías incluidas", "pack figuras", "coleccionista", "regalo", "CE marcado"],
  },
  mascotas: {
    brands: ["Royal Canin", "Purina", "Orijen", "Ferplast", "Catit", "Kong", "Flexi", "Hunter", "Trixie", "SureFeed", "Petkit", "Lilys Kitchen"],
    models: [
      "Medium Adult", "Pro Plan Sensitive", "Original Dog", "Sirio cage", "Flower Fountain",
      "Classic KONG", "New Neon", "Milan harness", "Snack ball", "Microchip feeder",
      "Pura Max", "Adult Turkey", "Arnésel acolchado", "Cama ortopédica", "Rascador árbol",
      "Arena aglomerante", "Snacks dental", "Transportín avión", "Collar GPS", "Champú hipoalergénico",
    ],
    variants: ["15kg", "7kg", "talla M", "talla L", "gato", "perro", "cachorro", "senior", "grain free", "veterinario"],
  },
  automovil: {
    brands: ["Michelin", "Continental", "Bosch", "Thule", "Garmin", "Nextbase", "BlackVue", "Valeo", "Philips", "Sonax", "Meguiar's", "Nilfisk"],
    models: [
      "Pilot Sport 5", "PremiumContact 7", "Aerotwin", "WingBar Evo", "DriveSmart 76",
      "622GW", "DR970X", "ClimControl", "X-tremeVision", "Car Shampoo",
      "Ultimate Compound", "Alto 6P", "Compresor 12V", "Arrancador batería", "Cable Type2",
      "Soporte móvil MagSafe", "Organizador maletero", "Funda asientos", "Ambientador", "Líquido limpiaparabrisas",
    ],
    variants: ["205/55 R16", "225/45 R17", "4 estaciones", "verano", "pack 4", "homologado", "12V", "Type 2", "negro", "kit detailing"],
  },
  movilidad: {
    brands: ["Xiaomi", "Segway", "Ninebot", "VanMoof", "Orbea", "Specialized", "Giant", "Cannondale", "Brompton", "Cecotec", "Xiaomi", "Pure Electric"],
    models: [
      "Scooter 5 Pro", "MAX G3", "E2 Pro", "S5", "Gain M30",
      "Turbo Vado SL", "Trance X", "Synapse Carbon", "P Line", "Bongo Serie A",
      "Elops 920", "Mi Scooter 4 Lite", "Air Pro", "Casco urbano", "Candado U",
      "Luz delantera USB", "Timbre eléctrico", "Portabotellas", "Sillín gel", "Mudguard set",
    ],
    variants: ["25 km/h", "45 km autonomía", "plegable", "eléctrica", "talla M", "carbono", "aluminio", "negro", "pack accesorios", "homologado UE"],
  },
  "cafe-te": {
    brands: ["Nespresso", "Lavazza", "Illy", "DeLonghi", "Bialetti", "Hario", "Chemex", "Twinings", "Tetley", "Cafés La Mexicana", "Taza", "Starbucks"],
    models: [
      "Vertuo Pop", "A Modo Mio", "Y3.3", "Dedica Arte", "Moka Express 6",
      "V60 kit", "Classic 6 cup", "English Breakfast", "Green Tea Lemon", "Café grano Arábica",
      "Cápsulas compatibles", "Molino manual", "Leche vegetal barista", "Termo 500ml", "Cuchara medidora",
      "Filtros papel", "Tetera acero", "Matcha ceremonial", "Rooibos vanilla", "Chai latte mix",
    ],
    variants: ["pack 100", "intensidad 8", "descafeinado", "orgánico", "1kg", "250g", "regalo", "Edición España", "Nespresso", "Dolce Gusto"],
  },
  "vinos-gourmet": {
    brands: ["Rioja", "Ribera", "Protos", "Marqués de Riscal", "Torres", "Freixenet", "G.H. Mumm", "La Chinata", "José Andrés", "Brindisa", "Conservas", "Delicioso"],
    models: [
      "Reserva 2018", "Crianza Magnum", "Gran Reserva", "Viña Esmeralda", "Mas La Plana",
      "Cava Brut Nature", "Champagne Brut", "AOVE Picual 500ml", "Jamón ibérico 5J", "Queso manchego DOP",
      "Anchoas Cantábrico", "Aceitunas Gordal", "Salsa trufa", "Vermut rojo", "Gineta premium",
      "Pack degustación", "Cesta regalo", "Chocolates Valor", "Mermelada artesana", "Sal ahumada",
    ],
    variants: ["750ml", "magnum", "DO Rioja", "DO Ribera", "ecológico", "sin sulfitos", "pack 3", "regalo gourmet", "DOP", "temporada 2024"],
  },
  alimentacion: {
    brands: ["Gullón", "Cuétara", "La Vieja Fábrica", "Heinz", "Barilla", "Gallo", "Brillante", "Pascual", "Danone", "Activia", "Hacendado style", "Ecocesta"],
    models: [
      "Galletas sin azúcar", "Digestive chocolate", "Mermelada frutos rojos", "Ketchup zero", "Pasta Integrale 500g",
      "Arroz bomba 1kg", "Quinoa ecológica", "Leche avena", "Yogur griego", "Batido proteína",
      "Aceite girasol", "Atún aceite oliva", "Legumbres cocidas", "Cereales fitness", "Barrita energética",
      "Café molido descafeinado", "Té matcha culinary", "Salsa soja baja sal", "Chocolate 85%", "Pack despensa",
    ],
    variants: ["pack 6", "sin gluten", "vegano", "bio", "1kg", "500g", "ahorro familiar", "sin lactosa", "alto proteína", "caducidad larga"],
  },
  manualidades: {
    brands: ["Cricut", "Silhouette", "Brother", "DMC", "Prym", "Clover", "Fiskars", "Winsor & Newton", "Faber-Castell", "Staedtler", "Pilot", "Moleskine"],
    models: [
      "Maker 4", "Cameo 5", "ScanNCut SDX", "Hilo mouliné set", "Cinta métrica",
      "Agujas crochet", "Rotary cutter", "Acuarela profesional", "Polychromos 120", "Fineliner",
      "G-Tech", "Classic notebook", "Papel acuarela A4", "Lienzo 40x50", "Caballette campo",
      "Pegamento pistola", "Vinilo HTV roll", "Plantillas lettering", "Resina epoxi kit", "Molde silicona",
    ],
    variants: ["pack 50", "A4", "A3", "colores surtidos", "principiante", "pro", "manual español", "regalo", "edición 2025", "craft"],
  },
  instrumentos: {
    brands: ["Yamaha", "Roland", "Kawai", "Fender", "Ibanez", "Taylor", "Marshall", "Boss", "Shure", "AKG", "Casio", "Korg"],
    models: [
      "P-225", "FP-30X", "ES120", "Player Plus Strat", "RG550",
      "214ce", "DSL40CR", "Katana 100", "SM7B", "C414 XLII",
      "Privia PX-S1100", "minilogue xd", "Bongo cajón", "Ukelele concert", "Violín estudiante",
      "Cuerdas guitarra", "Púa pack", "Atril partituras", "Metrónomo digital", "Afinador clip",
    ],
    variants: ["88 teclas", "acústica", "eléctrica", "4/4", "negro", "natural", "pack amplificador", "USB audio", "estudio", "garantía 2 años"],
  },
  impresion: {
    brands: ["HP", "Brother", "Canon", "Epson", "Xerox", "Kyocera", "Ricoh", "Samsung", "Lexmark", "OKI", "Zebra", "Dymo"],
    models: [
      "LaserJet Pro 4002", "HL-L2405W", "MAXIFY GX7050", "EcoTank L6290", "WorkCentre 6515",
      "ECOSYS M2040", "SP 330DN", "Xpress M2020", "MS431dn", "C332dn",
      "ZD621", "LabelWriter 550", "Toner negro XL", "Cartucho tricolor", "Papel fotográfico",
      "Sobres DL", "Grapadora industrial", "Encuadernadora térmica", "Laminadora A3", "Escáner documentos",
    ],
    variants: ["WiFi", "dúplex", "ADF", "color", "mono", "pack 2 toner", "alta capacidad", "oficina", "hogar", "compatible"],
  },
  colchones: {
    brands: ["Emma", "Simba", "Casper", "Dormideo", "Pikolin", "Sonpura", "Flex", "Ikea", "Molina", "Velfont", "Therapedic", "Mysleep"],
    models: [
      "Hybrid Cooling", "Pro Air", "Nova Snow", "Zen Pro", "Royal Flex",
      "Gold Visco", "Dorsal ortopédico", "VALEVÅG firme", "Viscografeno", "Cloud Topper",
      "Almohada cervical", "Nórdico invierno", "Sábanas algodón", "Protector impermeable", "Base somier",
      "Canapé storage", "Cabecero tapizado", "Edredón plumón", "Funda nórdica", "Manta sofa",
    ],
    variants: ["135x190", "150x200", "90x200", "firmeza media", "firmeza alta", "visco", "muelles", "pack 2 almohadas", "trial 100 noches", "envío gratis"],
  },
  electronica: {
    brands: ["Apple", "Sony", "Bose", "Sennheiser", "JBL", "Anker", "Belkin", "Tile", "Garmin", "Fitbit", "Amazon", "Google"],
    models: [
      "AirPods 4 ANC", "WH-1000XM6", "QC Ultra Earbuds", "Momentum True Wireless 4", "Tour Pro 3",
      "Prime 27650mAh", "BoostCharge Pro", "Mate", "Forerunner 265S", "Sense 2",
      "Echo Dot 5", "Nest Hub Max", "Kindle Colorsoft", "Kobo Clara BW", "Fire HD 10",
      "Stick 4K", "Chromecast HD", "SSD T9 2TB", "Hub 7-in-1", "Cable USB4 2m",
    ],
    variants: ["negro", "blanco", "USB-C", "Bluetooth 5.3", "pack 2", "garantía", "español", "UE", "recargable", "smart home"],
  },
};

function expandNames(catId, existingNames, min = TARGET_PER_CAT) {
  const seeds = SEEDS[catId];
  if (!seeds) return [];
  const out = [];
  const local = new Set();
  const push = (name) => {
    if (local.has(name) || existingNames.has(name)) return;
    local.add(name);
    out.push(name);
  };
  for (const b of seeds.brands) {
    for (const m of seeds.models) {
      for (const v of seeds.variants) {
        push(`${b} ${m} — ${v}`);
        if (out.length >= min + 8) return out.slice(0, min + 8);
      }
    }
  }
  let i = 0;
  while (out.length < min + 8) {
    const b = seeds.brands[i % seeds.brands.length];
    const m = seeds.models[i % seeds.models.length];
    push(`${b} ${m} — serie ${2024 + (i % 2)} ed. ${i + 1}`);
    i++;
    if (i > 500) break;
  }
  return out.slice(0, min + 8);
}

const existingNames = loadExistingNames();
const NAMES = {};
for (const meta of CAT_META) {
  NAMES[meta.id] = expandNames(meta.id, existingNames, TARGET_PER_CAT);
  if (NAMES[meta.id].length < TARGET_PER_CAT) {
    console.warn(`WARN ${meta.id}: only ${NAMES[meta.id].length} names`);
  }
}

const namesJson = JSON.stringify(NAMES, null, 2);
const totalNames = Object.values(NAMES).reduce((s, a) => s + a.length, 0);
console.log("Total seed names:", totalNames);

const header = `/**
 * Catálogo 7 — semillas de producto (c7-).
 * Generado por scripts/_gen-catalog7.mjs — no editar a mano el bloque NAMES.
 */

export const CATALOG_7_CATEGORIES = [];

const IMG = ${JSON.stringify(
  {
    informatica: "1517334736513-489689fd1ca8",
    perifericos: "1587825140826-daf39de24e4a",
    componentes: "1591488320449-011701bb6704",
    telefonia: "1511707171634-5ed0d9d2faeb",
    tablets: "1544244015-0df4b3ffc6b0",
    gaming: "1542755963-507a5a7583f7",
    tvaudio: "1526170375885-4d8ead0a603b",
    foto: "1516035069371-29a1b244cc32",
    smart: "1558003819-3d1e0e4b8b8b",
    hogarcocina: "1556911223-bff31c812dba",
    pequelectro: "1585513219862-1f48a122d05a",
    hogar: "1586023492125-27b2c94524d8",
    limpieza: "1558317374-067fb5fbb999",
    clima: "1631545719721-4089b6e5f1a0",
    belleza: "1596462502279-4b4eaa7b7b8b",
    salud: "1571019613455-1a2e7d1e3d6b",
    deportes: "1571019614242-c5c5dee9f50e",
    ropa: "1542291026-7eec264c27ff",
    relojes: "1524592094714-0f0654e20314",
    viaje: "1553062407-98eeb64c04a8",
    playa: "1507525428034-b723cf961d3c",
    jardin: "1416879595882-3373a0480b2b",
    bricolaje: "1504143531064-ef691c8a3f1a",
    oficina: "1497366216548-37526070297c",
    libros: "1512820790812-9d5589997378",
    bebes: "1515488042361-ee00e310d9fe",
    juguetes: "1558066620-4b7a87f5dca8",
    mascotas: "1583511655855-d58739890a07",
    automovil: "1492144534657-ae79c964c9d7",
    movilidad: "1571068316344-75bc76f77890",
    cafe: "1495474473867-173d179c1d51",
    vino: "1510818815521-354f922f6a2b",
    alimentacion: "1559056199-641a0ac8b80c",
    manualidades: "1452860600485-3d0c12ef2d88",
    musica: "1511379936297-554b3c9499f3",
    impresion: "1612815157329-448fe73f0f4d",
    colchones: "1631048887204-6637e4c4a1f4",
    electronica: "1498049794561-7780e7231661",
  },
  null,
  2,
)};

const ST = ["amazon", "mediamarkt", "elcorteingles"];
const ST_PC = ["amazon", "pccomponentes", "mediamarkt"];
const ST_DEC = ["amazon", "decathlon", "mediamarkt"];
const ST_FNAC = ["amazon", "fnac", "mediamarkt"];
const ST_IKEA = ["amazon", "ikea", "mediamarkt"];
const ST_BOOK = ["amazon", "fnac", "casadellibro"];

const STORE_MAP = { ST, ST_PC, ST_DEC, ST_FNAC, ST_IKEA, ST_BOOK };

const NAMES = ${namesJson};

const CAT_META = ${JSON.stringify(CAT_META)};

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

const URLS = {
  amazon: (q) => \`https://www.amazon.es/s?k=\${encodeURIComponent(q)}\`,
  pccomponentes: (q) => \`https://www.pccomponentes.com/search/?query=\${encodeURIComponent(q)}\`,
  mediamarkt: (q) => \`https://www.mediamarkt.es/es/search.html?query=\${encodeURIComponent(q)}\`,
  elcorteingles: (q) => \`https://www.elcorteingles.es/search/?s=\${encodeURIComponent(q)}\`,
  fnac: (q) => \`https://www.fnac.es/SearchResult/ResultList.aspx?Search=\${encodeURIComponent(q)}\`,
  decathlon: (q) => \`https://www.decathlon.es/search?query=\${encodeURIComponent(q)}\`,
  ikea: (q) => \`https://www.ikea.com/es/es/search/?q=\${encodeURIComponent(q)}\`,
  casadellibro: (q) => \`https://www.casadellibro.com/resultados-busqueda?keyword=\${encodeURIComponent(q)}\`,
  ebay: (q) => \`https://www.ebay.es/sch/i.html?_nkw=\${encodeURIComponent(q)}\`,
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
  const search = name.split("—")[0].trim();
  const offs = offers(search, price, storeList);
  const best = offs[0].price;
  const discount = Math.max(0, Math.round((1 - best / orig) * 100));
  const listingKind = discount >= 15 ? "deal" : "catalog";
  return {
    id: "",
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
    listingKind,
    image: PLACEHOLDER_IMAGE,
    offers: offs,
    videoHook: \`Comparativa de precios: \${search}\`,
    keywords: kw || [search.toLowerCase(), category],
  };
}

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

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function tuple(name, catId, idx) {
  const h = hash(name + catId);
  const tier = ((h % 7) + 1) * 10;
  const orig = tier * 10 + (h % 900) + 15 + idx * 3;
  const disc = 8 + (h % 28);
  const price = Math.max(0.01, Math.round(orig * (1 - disc / 100) * 100) / 100);
  const origR = Math.max(price + 0.01, Math.round(orig * 100) / 100);
  const rating = Math.round((4.2 + (h % 8) / 10) * 10) / 10;
  const reviews = 800 + (h % 50000);
  const trending = h % 3 === 0 ? 1 : 0;
  return [name, price, origR, rating, reviews, trending];
}

export function buildCatalog7Products(existingNames = new Set()) {
  const skip = existingNames instanceof Set ? existingNames : new Set(existingNames);
  const all = [];
  for (const meta of CAT_META) {
    const names = (NAMES[meta.id] || []).filter((n) => !skip.has(n));
    const stores = STORE_MAP[meta.stores] || ST;
    const rows = names.map((n, i) => tuple(n, meta.id, i));
    all.push(
      ...bulk(
        rows,
        meta.id,
        (n) => \`\${n} — disponible en tiendas España.\`,
        meta.img,
        stores,
      ),
    );
  }
  const seen = new Set();
  for (const p of all) {
    const base = slug(p.name);
    let id = \`c7-\${base.length > 3 ? base : p.category + "-" + base}\`;
    let n = 2;
    while (seen.has(id)) id = \`c7-\${base}-\${n++}\`;
    p.id = id;
    seen.add(id);
  }
  return all;
}
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header, "utf8");

const mod = await import(`file://${OUT.replace(/\\/g, "/")}`);
const prods = mod.buildCatalog7Products(existingNames);
console.log("Products:", prods.length);
console.log("Categories:", CAT_META.length);
const bad = prods.filter((p) => p.price <= 0 || p.originalPrice <= 0);
console.log("Bad prices:", bad.length);
const noPrefix = prods.filter((p) => !p.id.startsWith("c7-"));
console.log("Missing c7 prefix:", noPrefix.length);
const badImg = prods.filter((p) => !p.image.includes("placeholder"));
console.log("Non-placeholder images:", badImg.length);
if (prods.length < 3620) {
  console.error("FAIL: need >= 3620 products");
  process.exit(1);
}
