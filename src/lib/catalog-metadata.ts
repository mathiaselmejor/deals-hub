import type { Product } from "./types";

export function parseNameParts(name: string) {
  const [main, variant] = name.split("—").map((s) => s.trim());
  const brand = main.split(/\s+/)[0] ?? "";
  const model = main.split(/\s+/).slice(1).join(" ") || main;
  return { brand, model, variant: variant ?? "", search: main };
}

/** Metadatos honestos derivados del nombre — sin specs técnicas inventadas. */
export function enrichCatalogMetadata(product: Product): Product {
  const isGenerated = /^c[6-9]-/.test(product.id);
  if (!isGenerated && product.listingKind !== "catalog") return product;
  if (!isGenerated && product.specs && product.longDescription) return product;

  const { brand, model, variant, search } = parseNameParts(product.name);
  const catLabel = product.category.replace(/-/g, " ");
  const storeLabels = product.offers?.map((o) => o.store).join(", ") ?? "varias tiendas";

  const description =
    product.description ||
    `${search}${variant ? ` (${variant})` : ""}. Comparativa en ${storeLabels}. Precio orientativo.`;

  const longDescription = [
    `${product.name}.`,
    `Producto de ${catLabel} listado en DealsHub para comparar precios en tiendas asociadas en España.`,
    variant ? `Variante indicada: ${variant}.` : "",
    "El precio mostrado es orientativo: confirma el importe final, disponibilidad y variantes en la tienda antes de comprar.",
  ]
    .filter(Boolean)
    .join(" ");

  const specs: Record<string, string> = {
    Categoría: catLabel,
    ...(brand ? { Marca: brand } : {}),
    ...(model && model !== brand ? { Modelo: model } : {}),
    ...(variant ? { Variante: variant } : {}),
    Tiendas: storeLabels,
    "Precio DealsHub": "Orientativo",
  };

  const extraKw = [brand, model, variant, catLabel].map((s) => s?.toLowerCase()).filter(Boolean);

  return {
    ...product,
    description,
    longDescription,
    specs,
    pros: product.pros ?? [
      "Comparativa en varias tiendas españolas desde un solo sitio",
      "Imagen y ficha directa de Amazon cuando el ASIN está verificado",
    ],
    cons: product.cons ?? [
      "Precio orientativo hasta confirmar en la tienda elegida",
      "Las variantes pueden diferir según stock del vendedor",
    ],
    buyingGuide: product.buyingGuide ?? [
      "Compara precio final incluyendo envío y cupones en cada tienda",
      "Verifica que la variante del título coincide con la ficha del vendedor",
      "Revisa plazos de entrega y política de devoluciones",
    ],
    faq: product.faq ?? [
      {
        q: "¿El precio es exacto?",
        a: "Mostramos un precio orientativo de referencia en el comparador. El importe final puede variar; confírmalo siempre en la tienda.",
      },
      {
        q: "¿Por qué no aparece descuento tachado?",
        a: "No mostramos descuentos inventados. Solo indicamos ahorro cuando verificamos precios reales en ficha de producto.",
      },
    ],
    keywords: [...new Set([...(product.keywords ?? []), ...extraKw])],
  };
}
