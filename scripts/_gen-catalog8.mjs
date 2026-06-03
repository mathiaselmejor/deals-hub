#!/usr/bin/env node
/**
 * Genera scripts/lib/catalog-8-seeds.mjs — accesorios y recambios (c8-).
 * node scripts/_gen-catalog8.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  CAT_META,
  expandNames,
  loadExistingNames,
  buildCatalogFromNames,
} from "./lib/catalog-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "lib/catalog-8-seeds.mjs");
const dataDir = path.join(__dirname, "../data");

const TARGET_PER_CAT = 72;

/** Accesorios, consumibles y recambios — nombres distintos al catálogo principal c6/c7. */
const ACCESSORY_SEEDS = {
  informatica: {
    brands: ["Ugreen", "Baseus", "Anker", "Targus", "Tomtoc", "Inateck", "Satechi", "HyperDrive"],
    models: [
      "Funda neopreno 14", "Mochila antirrobo 15.6", "Soporte aluminio", "Hub USB-C 7 en 1",
      "Dock Thunderbolt 4", "Filtro privacidad 14", "Teclado BT compacto", "Ratón ergonómico vertical",
      "Base refrigeración", "Cable USB4 2m", "Adaptador HDMI 4K", "Organizador cables",
    ],
    variants: ["negro", "gris", "compatible Mac", "compatible Windows", "pack 2", "USB-C 100W", "español", "garantía 2 años"],
  },
  perifericos: {
    brands: ["Keychron", "Glorious", "Pulsar", "Endgame Gear", "Wooting", "Artisan", "Lethal Gaming", "Xtrfy"],
    models: [
      "Alfombrilla XL", "Reposamuñecas gel", "Switch lubed kit", "Cable aviator USB-C",
      "Patas teclado acero", "Grip tape ratón", "Protector teclas PBT", "Estuche transporte",
      "Brazo micrófono bajo perfil", "Pop filter doble", "Anillos O-ring", "Keycap puller pro",
    ],
    variants: ["negro", "blanco", "65%", "75%", "TKL", "español ISO", "soft", "control"],
  },
  "componentes-pc": {
    brands: ["Thermal Grizzly", "Arctic", "CableMod", "Lian Li", "Phanteks", "EKWB", "Gelid", "Scythe"],
    models: [
      "Pasta térmica 5g", "Kit ventiladores PWM", "Extensiones GPU", "Soporte GPU vertical",
      "Filtro polvo magnético", "Hub ARGB 6 canales", "Bracket SSD M.2", "Adaptador 12VHPWR",
      "Kit tornillería", "Goma anti-vibración", "Splitters SATA", "Backplate custom",
    ],
    variants: ["negro", "blanco", "120mm", "140mm", "pack 3", "ATX", "SFX", "Gen5"],
  },
  telefonia: {
    brands: ["Spigen", "OtterBox", "ESR", "Ringke", "Mous", "Pitaka", "Torras", "UAG"],
    models: [
      "Funda MagSafe", "Protector cámara", "Cristal templado 2 pack", "Soporte coche MagSafe",
      "Batería externa 10000", "Cable USB-C 1m", "Anillo grip", "Funda wallet",
      "Adaptador SIM eSIM", "Porta tarjetas RFID", "Correa muñeca", "Kit limpieza pantalla",
    ],
    variants: ["iPhone 16", "Galaxy S24", "Pixel 9", "transparente", "negro", "verde", "pack ahorro", "MIL-STD"],
  },
  tablets: {
    brands: ["ESR", "MoKo", "JETech", "Logitech", "Apple", "Samsung", "Baseus", "Nillkin"],
    models: [
      "Funda con teclado", "Lápiz capacitivo", "Protector pantalla mate", "Soporte ajustable",
      "Funda rugged niños", "Hub USB-C tablet", "Funda book cover", "Correa mano",
      "Almohadilla teclado", "Cap lápiz", "Funda slim", "Stand aluminio",
    ],
    variants: ["iPad 11", "Tab S10", "11 pulgadas", "12 pulgadas", "Bluetooth", "negro", "rosa", "pack"],
  },
  gaming: {
    brands: ["HyperX", "Razer", "PowerA", "Hori", "Nintendo", "Sony", "8BitDo", "Elgato"],
    models: [
      "Funda transporte Switch", "Grip mandos Pro", "Base carga dual", "Cable HDMI 2.1 3m",
      "Protector pantalla Steam Deck", "Skin consola", "Thumb grips 8 pack", "Estación dock",
      "Funda mando", "Soporte cascos", "Organizador juegos", "Micrófono streaming",
    ],
    variants: ["PS5", "Xbox", "Switch", "PC", "negro", "blanco", "edición", "licencia oficial"],
  },
  "tv-audio": {
    brands: ["Sanus", "Meliconi", "Vogels", "AudioQuest", "KabelDirekt", "Amazon Basics", "Belkin", "One For All"],
    models: [
      "Soporte TV inclinable 55", "Barra sonido wall mount", "Cable óptico 3m", "Adaptador HDMI ARC",
      "Regleta protección", "Antena interior TDT", "Control universal", "Organizador cables TV",
      "Kit limpieza pantalla", "Extensor HDMI activo", "Split HDMI 1 ent 2 sal", "Base soundbar",
    ],
    variants: ["32-55", "55-65", "65-75", "VESA 400", "4K120", "eARC", "2m", "5m"],
  },
  "foto-video": {
    brands: ["Peak Design", "SmallRig", "Ulanzi", "Neewer", "SanDisk", "Lexar", "ProGrade", "Lowepro"],
    models: [
      "Correa Peak Design Slide", "Placa L rápida", "Luz LED panel", "Trípode compacto",
      "Funda objetivo", "Tarjeta SD V90 128", "Lector dual CFexpress", "Mochila foto 25L",
      "Filtro ND variable", "Kit limpieza sensor", "Cold shoe mount", "Follow focus manual",
    ],
    variants: ["Sony E", "Canon RF", "Fuji X", "negro", "pack", "profesional", "viaje", "vlog"],
  },
  "smart-home": {
    brands: ["Aqara", "Sonoff", "Shelly", "TP-Link Tapo", "Meross", "Tuya", "Govee", "SwitchBot"],
    models: [
      "Sensor puerta Zigbee", "Interruptor pared neutral", "Módulo relé mini", "Sensor temperatura",
      "Hub Matter", "Tira LED WiFi", "Sensor movimiento", "Enchufe medidor energía",
      "Sensor inundación", "Control IR universal", "Botón escena 4", "Sensor humo Zigbee",
    ],
    variants: ["Matter", "Thread", "Zigbee", "WiFi", "pack 2", "pack 4", "blanco", "sin neutro"],
  },
  "hogar-cocina": {
    brands: ["OXO", "Joseph Joseph", "Lacor", "Ibili", "Arcos", "Victorinox", "Microplane", "Le Creuset acc"],
    models: [
      "Pelador juliana", "Termómetro carne digital", "Balanza cocina 5kg", "Rodillo silicona",
      "Tapas herméticas set", "Organizador nevera", "Abrebotellas sommelier", "Molinillo sal pimienta",
      "Espátula acero", "Colador plegable", "Medidor copas", "Guante horno silicona",
    ],
    variants: ["inox", "negro", "rojo", "set 3", "set 5", "apta lavavajillas", "regalo", "chef"],
  },
  "pequeno-electro": {
    brands: ["Melitta", "Bosch acc", "Philips acc", "Rowenta acc", "Dyson acc", "Moulinex acc", "Tefal acc", "Cecotec acc"],
    models: [
      "Filtro HEPA repuesto", "Bolsa aspirador pack 4", "Descalcificador cafetera", "Filtro agua jarra",
      "Accesorio plancha vapor", "Cepillo turbo", "Recambio cuchilla batidora", "Filtro freidora",
      "Base carga robot", "Mopa microfibra 2 uds", "Depósito agua repuesto", "Kit mantenimiento",
    ],
    variants: ["compatible original", "pack ahorro", "universal", "serie 5000", "serie 7000", "XL", "OFERTA", "OFERTA pack"],
  },
  hogar: {
    brands: ["IKEA acc", "Brabantia", "Simplehuman", "Joseph Joseph", "Zara Home acc", "H&M Home acc", "Compactor", "Tatay"],
    models: [
      "Organizador cajón", "Percha madera 5 uds", "Caja almacenaje tapa", "Separador armario",
      "Espejo aumento", "Dispensador jabón", "Escobilla WC", "Cortina baño antimoho",
      "Alfombrilla baño", "Perchero pared", "Cesta ropa plegable", "Organizador zapatero",
    ],
    variants: ["blanco", "gris", "beige", "40cm", "60cm", "bambú", "reciclado", "pack 2"],
  },
  "aspiracion-limpieza": {
    brands: ["Dyson acc", "Roborock acc", "iRobot acc", "Kärcher acc", "Miele acc", "Bissell acc", "Vileda", "Leifheit"],
    models: [
      "Filtro HEPA repuesto", "Cepillo turbo", "Mopa lavable 2 uds", "Bolsa polvo pack",
      "Kit rodillos Roomba", "Detergente suelos 1L", "Recambio escoba", "Fregona microfibra",
      "Accesorio grietas", "Batería repuesto", "Base autovaciado bolsa", "Cepillo mascotas",
    ],
    variants: ["original", "compatible", "pack 2", "pack 4", "XL", "antialergénico", "lavable", "recambio"],
  },
  climatizacion: {
    brands: ["Taurus acc", "Rowenta acc", "Cecotec acc", "Honeywell acc", "Dyson acc", "Philips acc", "Pro Breeze", "Princess"],
    models: [
      "Filtro HEPA purificador", "Mando universal AC", "Kit ventana portátil", "Difusor aromas",
      "Higrómetro digital", "Timer enchufe", "Extension tubo aire", "Filtro carbón activo",
      "Recambio ionizador", "Protector ventilador", "Bandeja condensados", "Sensor temperatura WiFi",
    ],
    variants: ["universal", "9000 BTU", "12000 BTU", "HEPA", "carbón", "WiFi", "pack 2", "silencioso"],
  },
  belleza: {
    brands: ["Real Techniques", "Sigma", "Beautyblender", "Sephora acc", "The Ordinary acc", "Foreo acc", "GHD acc", "Dyson acc"],
    models: [
      "Set brochas 12", "Esponja maquillaje 2 uds", "Neceser viaje", "Organizador labiales",
      "Espejo aumento LED", "Pinza cejas", "Lima uñas cristal", "Separador dedos",
      "Capucha secado", "Toalla microfibra pelo", "Difusor secador", "Estuche plancha"],
    variants: ["vegano", "regalo", "travel", "rosa", "negro", "profesional", "pack", "edición limitada"],
  },
  "salud-deporte": {
    brands: ["Theraband", "TriggerPoint", "Hyperice acc", "Compex acc", "Beurer acc", "Omron acc", "Fitbit acc", "Garmin acc"],
    models: [
      "Banda elasticidad media", "Pelota masaje 12cm", "Rodillo foam", "Electrodos TENS 4 uds",
      "Manguito compresión", "Báscula grasa Bluetooth", "Tensiómetro brazo M", "Oxímetro repuesto",
      "Correa reloj silicona", "Protector pantalla reloj", "Cargador reloj", "Banda pecho FC",
    ],
    variants: ["M", "L", "pack 2", "recargable", "Bluetooth", "clínico", "deportivo", "unisex"],
  },
  deportes: {
    brands: ["Nike acc", "Adidas acc", "Decathlon acc", "Under Armour acc", "Compressport", "CamelBak", "Garmin acc", "Suunto acc"],
    models: [
      "Calcetines running 3 pares", "Cinturón hidratación", "Guantes gimnasio", "Banda sudor",
      "Plantillas running", "Botella 750ml", "Mochila trail 12L", "Gafas natación recambio",
      "Red pelo silicona", "Toalla microfibra", "Cuerda saltar", "Lotería dorsal carrera",
    ],
    variants: ["talla M", "talla L", "negro", "reflectante", "unisex", "pack 3", "trail", "gym"],
  },
  ropa: {
    brands: ["H&M acc", "Zara acc", "Calzedonia", "Tezenis", "Dim", "Falke", "Puma acc", "Nike acc"],
    models: [
      "Calcetines algodón 5 pares", "Cinturón piel reversible", "Pañuelo seda", "Guantes lana",
      "Gorro punto", "Bufanda oversize", "Tirantes elásticos", "Posavasos lencería",
      "Organizador corbatas", "Perchas terciopelo 10 uds", "Bolsa lavandería viaje", "Spray antiarrugas",
    ],
    variants: ["talla única", "M", "L", "negro", "beige", "algodón orgánico", "pack", "unisex"],
  },
  "relojes-accesorios": {
    brands: ["Casio acc", "Hirsch", "Barton", "NATO strap", "Ray-Ban acc", "Oakley acc", "Fossil acc", "Swarovski acc"],
    models: [
      "Correa NATO 20mm", "Correa silicona 22mm", "Estuche reloj 3 uds", "Kit herramientas reloj",
      "Protector pantalla reloj", "Caja colección 6 relojes", "Limpiador pulsera", "Adaptador 18 a 20mm",
      "Estuche viaje 2 relojes", "Pulsera repuesto smartwatch", "Cargador dock", "Fundas gafas sol",
    ],
    variants: ["18mm", "20mm", "22mm", "negro", "azul marino", "cuero", "acero", "quick release"],
  },
  "maletas-viaje": {
    brands: ["Samsonite acc", "Travelon", "Eagle Creek", "Sea to Summit", "Pacsafe", "Cabin Max acc", "Level8 acc", "American Tourister acc"],
    models: [
      "Organizador packing cubes 3", "Candado TSA 2 uds", "Etiqueta equipaje LED", "Almohada cervical memory",
      "Adaptador universal USB-C", "Bolsa lavandería", "Neceser colgante", "Funda impermeable maleta",
      "Correa equipaje", "Botella viaje 100ml set", "Máscara dormir", "Tapones oídos silicona",
    ],
    variants: ["cabina", "S", "M", "L", "negro", "pack viaje", "antirrobo", "reciclado"],
  },
  "piscina-playa": {
    brands: ["Intex acc", "Bestway acc", "Speedo acc", "Arena acc", "Cressi acc", "Sevylor acc", "Zoggs acc", "Decathlon acc"],
    models: [
      "Cloro piscina 5kg", "Filtro cartucho repuesto", "Toldo playa UV50", "Bolsa estanca móvil",
      "Chanclas agua", "Gafas snorkel recambio", "Flotador brazo niño", "Parche reparación lona",
      "Skimmer hojas", "Manguera piscina", "Escoba fondo", "Almohada flotante"],
    variants: ["piscina 366", "playa", "niño", "adulto", "pack", "UV50", "cloro", "recambio"],
  },
  jardin: {
    brands: ["Gardena acc", "Hozelock", "Fiskars acc", "Bosch acc", "Makita acc", "Kärcher acc", "Biohort acc", "Garland"],
    models: [
      "Manguera extensible 15m", "Pistola riego 7 modos", "Guantes jardinería", "Tijeras poda bypass",
      "Soporte manguera", "Conector rápido pack", "Semillas césped 1kg", "Abono universal 5L",
      "Maceta autorriego", "Insecticida natural", "Tela anti-hierbas", "Kit huerto urbano",
    ],
    variants: ["15m", "30m", "1/2", "3/4", "orgánico", "pack", "adulto", "eco"],
  },
  bricolaje: {
    brands: ["Würth acc", "Bosch acc", "DeWalt acc", "Makita acc", "Stanley acc", "Knipex acc", "Wiha acc", "Festool acc"],
    models: [
      "Broca madera set 10", "Disco corte metal 5 uds", "Cinta métrica 8m", "Nivel burbuja 60cm",
      "Guantes trabajo", "Gafas protección", "Mascarilla FFP2 10 uds", "Organizador tornillos",
      "Lápiz carpintero 12 uds", "Sierra marquetería", "Lijadora manual", "Pistola silicona",
    ],
    variants: ["HSS", "profesional", "bricolaje", "pack", "18V compatible", "made in EU", "negro", "amarillo"],
  },
  oficina: {
    brands: ["Fellowes acc", "Leitz acc", "3M acc", "Post-it acc", "Pilot acc", "Staedtler acc", "Moleskine acc", "Logitech acc"],
    models: [
      "Destructora partículas aceite", "Fundas plastificar 100", "Grapas 5000 uds", "Cinta adhesiva pack",
      "Organizador escritorio", "Reposapiés foam", "Soporte documentos", "Bandeja apilable 3 niveles",
      "Rotuladores fineline 12", "Cuaderno A4 puntos", "Etiquetas dirección", "Archivador palanca",
    ],
    variants: ["A4", "A5", "negro", "pack 5", "reciclado", "oficina", "colores", "profesional"],
  },
  libros: {
    brands: ["Planeta acc", "Penguin acc", "Anagrama acc", "Casa del Libro acc", "Fnac acc", "Amazon acc", "Audible acc", "Storytel acc"],
    models: [
      "Marcapáginas imantados 6 uds", "Luz lectura recargable", "Soporte libro madera", "Funda eReader",
      "Audiolibro tarjeta regalo", "Diario bullet journal", "Mapa pared desplegable", "Póster literario",
      "Pack clásicos bolsillo", "Guía vocabulario", "Cuaderno notas A5", "Estuche lápices lectura",
    ],
    variants: ["regalo", "español", "A5", "A6", "recargable", "madera", "pack 3", "edición 2025"],
  },
  "bebes-ninos": {
    brands: ["Philips Avent acc", "NUK acc", "Chicco acc", "Jané acc", "Medela acc", "Tommee Tippee acc", "MAM acc", "Suavinex acc"],
    models: [
      "Chupete 0-6 meses 2 uds", "Biberón anticólico", "Escobilla biberón", "Termómetro baño",
      "Monitor repuesto cámara", "Sábana cuna 60x120", "Protector cuna", "Bolsa maternidad",
      "Reducidor wc", "Almohada lactancia", "Mordedor silicona", "Dosificador leche polvo",
    ],
    variants: ["0-6m", "6-18m", "rosa", "azul", "neutro", "BPA free", "pack 2", "lavable"],
  },
  juguetes: {
    brands: ["LEGO acc", "Playmobil acc", "Hasbro acc", "Mattel acc", "Ravensburger acc", "Funko acc", "Nintendo acc", "Spin Master acc"],
    models: [
      "Caja almacenaje LEGO", "Baseplate verde 32x32", "Puzzle marco 1000p", "Cartas protección",
      "Pilas recargables 4 uds", "Organizador piezas", "Luz vitrina coleccionables", "Estuche cartas",
      "Accesorio Switch grip", "Volante kart Switch", "Figura repuesto", "Kit pintura miniaturas",
    ],
    variants: ["6+", "8+", "negro", "pack", "oficial", "compatible", "recargable", "regalo"],
  },
  mascotas: {
    brands: ["Royal Canin acc", "Purina acc", "Kong acc", "Ferplast acc", "Trixie acc", "Catit acc", "Hunter acc", "Petkit acc"],
    models: [
      "Bol plegable viaje", "Cepillo deshedding", "Arena aglomerante 10L", "Snack dental pack",
      "Correa extensible 5m", "Collar identificación", "Fuente repuesto filtro", "Transportín ventilado",
      "Rascador recambio", "Toallitas patas", "Comedero antideslizante", "Clicker adiestramiento",
    ],
    variants: ["perro M", "perro L", "gato", "pack", "hipoalergénico", "recambio", "viaje", "lavable"],
  },
  automovil: {
    brands: ["Michelin acc", "Bosch acc", "Garmin acc", "Nextbase acc", "Sonax acc", "Meguiar's acc", "Nilfisk acc", "Thule acc"],
    models: [
      "Líquido limpiaparabrisas 5L", "Ambientador clip", "Organizador asiento", "Funda volante",
      "Cargador coche USB-C 65W", "Soporte móvil ventosa", "Kit reparación pinchazos", "Medidor presión digital",
      "Cera protección", "Toalla microfibra auto", "Escoba maletero", "Cable OBD2",
    ],
    variants: ["universal", "12V", "USB-C", "negro", "pack detailing", "invierno", "verano", "OBD"],
  },
  movilidad: {
    brands: ["Xiaomi acc", "Segway acc", "Ninebot acc", "Cecotec acc", "ABUS", "Kryptonite", "Shimano acc", "Continental acc"],
    models: [
      "Candado U urbano", "Luz delantera USB", "Timbre eléctrico", "Sillín gel",
      "Portabotellas aluminio", "Guardabarros set", "Kit parche cámara", "Bomba mini mano",
      "Casco urbano M", "Guantes ciclismo", "Mudguard clip", "Soporte patinete pared",
    ],
    variants: ["M", "L", "negro", "recargable", "USB", "antirrobo", "bici", "patinete"],
  },
  "cafe-te": {
    brands: ["Hario acc", "Chemex acc", "Bialetti acc", "Melitta acc", "Lavazza acc", "Twinings acc", "Tetley acc", "DeLonghi acc"],
    models: [
      "Filtros V60 100 uds", "Molinillo manual cerámica", "Jarra leche acero", "Cuchara medidora",
      "Termo café 500ml", "Filtros cafetera goteo", "Infusor té acero", "Tetera cristal 1L",
      "Cápsulas compatibles 50 uds", "Kit latte art", "Tapete barista", "Descalcificador 250ml",
    ],
    variants: ["V60", "Chemex", "Moka 6", "pack 100", "acero", "cristal", "descafeinado", "regalo"],
  },
  "vinos-gourmet": {
    brands: ["La Chinata acc", "Brindisa acc", "Conservas acc", "DO Rioja acc", "DO Ribera acc", "Freixenet acc", "Protos acc", "Torres acc"],
    models: [
      "Sacacorchos sommelier", "Enfriador vino acero", "Copas Riedel 2 uds", "Tapón vacío 2 uds",
      "Aceite ajo negro 250ml", "Sal ahumada 200g", "Pack conservas Cantábrico", "Cesta regalo gourmet",
      "Vermut artesano", "Salsa trufa 90g", "Mermelada premium", "Queso curado porciones",
    ],
    variants: ["regalo", "DOP", "250ml", "500ml", "pack 3", "ecológico", "DO", "temporada"],
  },
  alimentacion: {
    brands: ["Gullón acc", "Brillante acc", "Pascual acc", "Danone acc", "Heinz acc", "Barilla acc", "Gallo acc", "Ecocesta acc"],
    models: [
      "Pack desayuno avena", "Legumbres cocidas 4 uds", "Aceite oliva virgen 1L", "Atún aceite pack 6",
      "Pasta integral 500g x4", "Arroz basmati 2kg", "Salsa tomate pack 3", "Cereales sin azúcar",
      "Barritas proteína 12 uds", "Frutos secos mix 1kg", "Miel ecológica 500g", "Pack despensa básica",
    ],
    variants: ["sin gluten", "vegano", "bio", "pack 6", "1kg", "ahorro", "sin lactosa", "alto proteína"],
  },
  manualidades: {
    brands: ["Cricut acc", "Brother acc", "DMC acc", "Winsor acc", "Faber acc", "Staedtler acc", "Pilot acc", "Moleskine acc"],
    models: [
      "Hojas vinilo HTV 5 uds", "Rotuladores fineliner 24", "Lienzo 40x50 3 uds", "Pinceles acuarela set",
      "Hilo mouliné 36 colores", "Cutting mat A3", "Pegamento pistola barras", "Resina epoxi 500ml",
      "Plantillas lettering", "Bloc dibujo A4", "Cutter precision", "Regla acrílico"],
    variants: ["A4", "A3", "pack", "principiante", "pro", "colores", "manual español", "craft"],
  },
  instrumentos: {
    brands: ["Yamaha acc", "Fender acc", "D'Addario", "Ernie Ball", "Boss acc", "Shure acc", "Hercules", "K&M"],
    models: [
      "Cuerdas guitarra acústica", "Púas pack 24", "Correa guitarra cuero", "Afinador clip",
      "Cable jack 3m", "Fundas ukulele", "Baquetas 5A par", "Pad práctica batería",
      "Sordina violín", "Resina arco", "Metrónomo digital", "Atril plegable"],
    variants: ["091", "046", "3m", "negro", "natural", "pack", "principiante", "estudio"],
  },
  impresion: {
    brands: ["HP acc", "Brother acc", "Canon acc", "Epson acc", "Xerox acc", "Kyocera acc", "Lexmark acc", "Dymo acc"],
    models: [
      "Toner negro compatible", "Cartucho tricolor pack", "Papel A4 5000 hojas", "Papel foto glossy 100",
      "Sobres DL 500 uds", "Etiquetas adhesivas A4", "Cinta laminadora", "Rodillo pickup",
      "Kit mantenimiento impresora", "Tambor imagen", "Bandeja papel extra", "Cable USB impresora",
    ],
    variants: ["XL", "compatible", "original", "A4", "500 hojas", "pack 2", "oficina", "hogar"],
  },
  colchones: {
    brands: ["Emma acc", "Simba acc", "Dormideo acc", "Pikolin acc", "Ikea acc", "Velfont acc", "Mysleep acc", "Sonpura acc"],
    models: [
      "Almohada visco cervical", "Protector colchón 150", "Sábanas algodón 160", "Nórdico invierno 220",
      "Topper visco 5cm", "Funda nórdica percal", "Edredón plumón", "Base somier 135",
      "Almohada fibra pack 2", "Sábana bajera ajustable", "Relleno cojín 50x50", "Manta sofa 130x170",
    ],
    variants: ["90", "135", "150", "180", "invierno", "verano", "algodón", "pack 2"],
  },
  electronica: {
    brands: ["Anker acc", "Belkin acc", "Tile acc", "Samsung acc", "Apple acc", "Google acc", "Ugreen acc", "Baseus acc"],
    models: [
      "Powerbank 20000mAh", "Cargador GaN 65W 3 puertos", "Cable USB-C 2m pack 2", "Hub HDMI 3 salidas",
      "Adaptador SD USB-C", "Localizador Tile 2 pack", "Funda Kindle", "Protector Switch OLED",
      "Soporte móvil escritorio", "Anillo MagSafe", "Estación carga 3 en 1", "Organizador cables magnético",
    ],
    variants: ["USB-C", "65W", "100W", "negro", "blanco", "pack 2", "MagSafe", "GaN"],
  },
};

const existingNames = loadExistingNames(dataDir, fs);
const NAMES = {};
for (const meta of CAT_META) {
  const seeds = ACCESSORY_SEEDS[meta.id];
  if (!seeds) {
    console.warn("Missing seeds for", meta.id);
    NAMES[meta.id] = [];
    continue;
  }
  NAMES[meta.id] = expandNames(seeds, existingNames, TARGET_PER_CAT);
  if (NAMES[meta.id].length < TARGET_PER_CAT) {
    console.warn(`WARN ${meta.id}: only ${NAMES[meta.id].length} names`);
  }
}

const totalNames = Object.values(NAMES).reduce((s, a) => s + a.length, 0);
console.log("Total c8 seed names:", totalNames);

const header = `/**
 * Catálogo 8 — accesorios y recambios (c8-).
 * Generado por scripts/_gen-catalog8.mjs
 */
import { buildCatalogFromNames, CAT_META } from "./catalog-builder.mjs";

export const CATALOG_8_CATEGORIES = [];

const NAMES = ${JSON.stringify(NAMES, null, 2)};

export function buildCatalog8Products(existingNames = new Set()) {
  return buildCatalogFromNames({
    namesByCategory: NAMES,
    meta: CAT_META,
    idPrefix: "c8",
    existingNames,
  });
}
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header, "utf8");

const mod = await import(`file://${OUT.replace(/\\/g, "/")}`);
const prods = mod.buildCatalog8Products(existingNames);
console.log("Products:", prods.length);
const badDisc = prods.filter((p) => p.discount > 0 || p.originalPrice > p.price + 0.01);
console.log("Non-transparent pricing:", badDisc.length);
const badImg = prods.filter((p) => !p.image.includes("placeholder"));
console.log("Non-placeholder images:", badImg.length);
if (prods.length < 2500) {
  console.error("FAIL: need >= 2500 products");
  process.exit(1);
}
