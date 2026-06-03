/**
 * Constructor de productos de catálogo con reglas de transparencia DealsHub:
 * - Precio orientativo (priceEstimated: true) hasta verificar en tienda
 * - originalPrice = price, discount = 0, listingKind = catalog
 * - Imagen placeholder hasta resolver ASIN
 */

export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export const ST = ["amazon", "mediamarkt", "elcorteingles"];
export const ST_PC = ["amazon", "pccomponentes", "mediamarkt"];
export const ST_DEC = ["amazon", "decathlon", "mediamarkt"];
export const ST_FNAC = ["amazon", "fnac", "mediamarkt"];
export const ST_IKEA = ["amazon", "ikea", "mediamarkt"];
export const ST_BOOK = ["amazon", "fnac", "casadellibro"];

export const STORE_MAP = { ST, ST_PC, ST_DEC, ST_FNAC, ST_IKEA, ST_BOOK };

export const CAT_META = [
  { id: "informatica", stores: "ST_PC" },
  { id: "perifericos", stores: "ST_PC" },
  { id: "componentes-pc", stores: "ST_PC" },
  { id: "telefonia", stores: "ST_PC" },
  { id: "tablets", stores: "ST_PC" },
  { id: "gaming", stores: "ST_PC" },
  { id: "tv-audio", stores: "ST" },
  { id: "foto-video", stores: "ST_FNAC" },
  { id: "smart-home", stores: "ST_PC" },
  { id: "hogar-cocina", stores: "ST" },
  { id: "pequeno-electro", stores: "ST" },
  { id: "hogar", stores: "ST_IKEA" },
  { id: "aspiracion-limpieza", stores: "ST" },
  { id: "climatizacion", stores: "ST" },
  { id: "belleza", stores: "ST" },
  { id: "salud-deporte", stores: "ST_DEC" },
  { id: "deportes", stores: "ST_DEC" },
  { id: "ropa", stores: "ST" },
  { id: "relojes-accesorios", stores: "ST" },
  { id: "maletas-viaje", stores: "ST" },
  { id: "piscina-playa", stores: "ST_DEC" },
  { id: "jardin", stores: "ST_IKEA" },
  { id: "bricolaje", stores: "ST" },
  { id: "oficina", stores: "ST_IKEA" },
  { id: "libros", stores: "ST_BOOK" },
  { id: "bebes-ninos", stores: "ST" },
  { id: "juguetes", stores: "ST_FNAC" },
  { id: "mascotas", stores: "ST" },
  { id: "automovil", stores: "ST" },
  { id: "movilidad", stores: "ST_DEC" },
  { id: "cafe-te", stores: "ST" },
  { id: "vinos-gourmet", stores: "ST" },
  { id: "alimentacion", stores: "ST" },
  { id: "manualidades", stores: "ST_FNAC" },
  { id: "instrumentos", stores: "ST_FNAC" },
  { id: "impresion", stores: "ST_PC" },
  { id: "colchones", stores: "ST_IKEA" },
  { id: "electronica", stores: "ST" },
];

const URLS = {
  amazon: (q) => `https://www.amazon.es/s?k=${encodeURIComponent(q)}`,
  pccomponentes: (q) => `https://www.pccomponentes.com/search/?query=${encodeURIComponent(q)}`,
  mediamarkt: (q) => `https://www.mediamarkt.es/es/search.html?query=${encodeURIComponent(q)}`,
  elcorteingles: (q) => `https://www.elcorteingles.es/search/?s=${encodeURIComponent(q)}`,
  fnac: (q) => `https://www.fnac.es/SearchResult/ResultList.aspx?Search=${encodeURIComponent(q)}`,
  decathlon: (q) => `https://www.decathlon.es/search?query=${encodeURIComponent(q)}`,
  ikea: (q) => `https://www.ikea.com/es/es/search/?q=${encodeURIComponent(q)}`,
  casadellibro: (q) => `https://www.casadellibro.com/resultados-busqueda?keyword=${encodeURIComponent(q)}`,
};

export function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Ofertas orientativas: variación mínima entre tiendas, sin descuento ficticio. */
export function buildTransparentOffers(search, refPrice, stores) {
  return stores
    .map((store, i) => ({
      store,
      url: URLS[store](search),
      price: Math.round(refPrice * (1 + (i === 0 ? 0 : 0.018 + i * 0.012)) * 100) / 100,
      priceEstimated: true,
      linkKind: "search",
    }))
    .sort((a, b) => a.price - b.price);
}

export function buildTransparentProduct(row) {
  const [name, category, desc, refPrice, rating, reviews, badge, trending, storeList] = row;
  const search = name.split("—")[0].trim();
  const offers = buildTransparentOffers(search, refPrice, storeList);
  const price = offers[0]?.price ?? refPrice;

  return enrichProductMetadata({
    id: "",
    name,
    category,
    description: desc,
    price,
    originalPrice: price,
    discount: 0,
    rating,
    reviews,
    badge: badge ?? "Catálogo",
    trending: !!trending,
    listingKind: "catalog",
    image: PLACEHOLDER_IMAGE,
    offers,
    videoHook: `Comparativa de precios: ${search}`,
    keywords: [search.toLowerCase(), category],
  });
}

/** Metadatos derivados del nombre — sin inventar specs técnicas. */
export function parseNameParts(name) {
  const [main, variant] = name.split("—").map((s) => s.trim());
  const brand = main.split(/\s+/)[0] ?? "";
  const model = main.split(/\s+/).slice(1).join(" ") || main;
  return { brand, model, variant: variant ?? "", search: main };
}

export function enrichProductMetadata(product) {
  const { brand, model, variant, search } = parseNameParts(product.name);
  const catLabel = product.category.replace(/-/g, " ");
  const storeLabels = product.offers?.map((o) => o.store).join(", ") ?? "varias tiendas";

  product.description =
    product.description ||
    `${search}${variant ? ` (${variant})` : ""}. Comparativa en ${storeLabels}. Precio orientativo.`;

  product.longDescription = [
    `${product.name}.`,
    `Producto de ${catLabel} listado en DealsHub para comparar precios en tiendas asociadas en España.`,
    variant ? `Variante indicada: ${variant}.` : "",
    "El precio mostrado es orientativo: confirma el importe final, disponibilidad y variantes en la tienda antes de comprar.",
  ]
    .filter(Boolean)
    .join(" ");

  product.specs = {
    Categoría: catLabel,
    ...(brand ? { Marca: brand } : {}),
    ...(model && model !== brand ? { Modelo: model } : {}),
    ...(variant ? { Variante: variant } : {}),
    Tiendas: storeLabels,
    "Precio DealsHub": "Orientativo",
  };

  product.pros = [
    "Comparativa en varias tiendas españolas desde un solo sitio",
    "Imagen y ficha directa de Amazon cuando el ASIN está verificado",
  ];

  product.cons = [
    "Precio orientativo hasta confirmar en la tienda elegida",
    "Las variantes pueden diferir según stock del vendedor",
  ];

  product.buyingGuide = [
    "Compara precio final incluyendo envío y cupones en cada tienda",
    "Verifica que la variante del título coincide con la ficha del vendedor",
    "Revisa plazos de entrega y política de devoluciones",
  ];

  product.faq = [
    {
      q: "¿El precio es exacto?",
      a: "Mostramos un precio orientativo de referencia en el comparador. El importe final puede variar; confírmalo siempre en la tienda.",
    },
    {
      q: "¿Por qué no aparece descuento tachado?",
      a: "No mostramos descuentos inventados. Solo indicamos ahorro cuando verificamos precios reales en ficha de producto.",
    },
  ];

  const extraKw = [brand, model, variant, catLabel].map((s) => s?.toLowerCase()).filter(Boolean);
  product.keywords = [...new Set([...(product.keywords ?? []), ...extraKw])];

  return product;
}

export function bulkTransparent(list, category, descTpl, stores, badge = "Catálogo") {
  return list.map(([name, refPrice, rating, reviews, trending]) =>
    buildTransparentProduct([
      name,
      category,
      descTpl(name),
      refPrice,
      rating ?? 4.4,
      reviews ?? 3000,
      badge,
      trending ?? 0,
      stores,
    ]),
  );
}

export function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Precio orientativo estable por nombre (sin originalPrice inflado). */
export function priceTuple(name, catId, idx) {
  const h = hash(name + catId);
  const tier = ((h % 9) + 1) * 10;
  const refPrice = Math.max(4.99, Math.round((tier * 8 + (h % 850) + idx * 2) * 100) / 100);
  const rating = Math.round((4.1 + (h % 9) / 10) * 10) / 10;
  const reviews = 400 + (h % 42000);
  const trending = 0;
  return [name, refPrice, rating, reviews, trending];
}

export function expandNames(seeds, existingNames, min = 72) {
  const out = [];
  const local = new Set();
  const skip = existingNames instanceof Set ? existingNames : new Set(existingNames);
  const push = (name) => {
    if (local.has(name) || skip.has(name)) return;
    local.add(name);
    out.push(name);
  };

  for (const b of seeds.brands) {
    for (const m of seeds.models) {
      for (const v of seeds.variants) {
        push(`${b} ${m} — ${v}`);
        if (out.length >= min + 6) return out.slice(0, min + 6);
      }
    }
  }

  let i = 0;
  while (out.length < min + 6 && i < 800) {
    const b = seeds.brands[i % seeds.brands.length];
    const m = seeds.models[i % seeds.models.length];
    push(`${b} ${m} — accesorio pack ${i + 1}`);
    i++;
  }
  return out.slice(0, min + 6);
}

export function buildCatalogFromNames({ namesByCategory, meta = CAT_META, idPrefix, existingNames = new Set() }) {
  const skip = existingNames instanceof Set ? existingNames : new Set(existingNames);
  const all = [];

  for (const cat of meta) {
    const names = (namesByCategory[cat.id] || []).filter((n) => !skip.has(n));
    const stores = STORE_MAP[cat.stores] || ST;
    const rows = names.map((n, i) => priceTuple(n, cat.id, i));
    all.push(
      ...bulkTransparent(
        rows,
        cat.id,
        (n) => `${n}. Precio orientativo — confirma en tienda antes de comprar.`,
        stores,
      ),
    );
  }

  const seen = new Set();
  for (const p of all) {
    const base = slug(p.name);
    let id = `${idPrefix}-${base.length > 3 ? base : p.category + "-" + base}`;
    let n = 2;
    while (seen.has(id)) id = `${idPrefix}-${base}-${n++}`;
    p.id = id;
    seen.add(id);
    enrichProductMetadata(p);
  }
  return all;
}

export function loadExistingNames(dataDir, fs) {
  const names = new Set();
  for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const data = JSON.parse(fs.readFileSync(`${dataDir}/${file}`, "utf-8"));
      for (const p of data.products ?? []) {
        if (p.name) names.add(p.name);
      }
    } catch {
      /* skip */
    }
  }
  return names;
}
