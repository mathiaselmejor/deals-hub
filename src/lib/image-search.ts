import { computeDealScore } from "./algorithms";
import type { Product } from "./types";

export type ImageSearchAnalysis = {
  productType: string;
  productName: string;
  brand: string | null;
  category: string | null;
  keywords: string[];
  searchQuery: string;
  confidence: number;
  descriptionEs: string;
};

export class ImageSearchError extends Error {
  constructor(
    public code: "not_configured" | "invalid_image" | "analysis_failed" | "rate_limited",
    message: string,
  ) {
    super(message);
    this.name = "ImageSearchError";
  }
}

const VISION_PROMPT = `Eres un asistente de compras en España. Analiza la imagen y detecta qué producto quiere comprar el usuario.
Responde SOLO con JSON válido (sin markdown):
{
  "productType": "tipo genérico en español (ej. auriculares inalámbricos)",
  "productName": "nombre probable del producto o modelo",
  "brand": "marca visible o null",
  "category": "una de: informatica, electronica, gaming, deportes, hogar, hogar-cocina, belleza, libros, moda, aliexpress, null",
  "keywords": ["5-8 palabras clave en español para buscar en tienda"],
  "searchQuery": "consulta corta en español (2-5 palabras)",
  "confidence": 0.0,
  "descriptionEs": "Una frase corta en español: qué crees que es el producto"
}
Si no es un producto de consumo, usa productType "objeto desconocido" y keywords genéricas relacionadas.`;

const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

export function isImageSearchConfigured(): boolean {
  return !!getGeminiApiKey();
}

export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    undefined
  );
}

function parseAnalysis(raw: string): ImageSearchAnalysis {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as Partial<ImageSearchAnalysis>;

  const keywords = Array.isArray(parsed.keywords)
    ? parsed.keywords.map((k) => String(k).toLowerCase().trim()).filter(Boolean)
    : [];

  const searchQuery = String(parsed.searchQuery ?? parsed.productName ?? parsed.productType ?? "")
    .trim()
    .slice(0, 120);

  if (!searchQuery && keywords.length === 0) {
    throw new ImageSearchError("analysis_failed", "No se pudo interpretar la imagen.");
  }

  return {
    productType: String(parsed.productType ?? "producto").trim(),
    productName: String(parsed.productName ?? searchQuery).trim(),
    brand: parsed.brand ? String(parsed.brand).trim() : null,
    category: parsed.category ? String(parsed.category).trim() : null,
    keywords,
    searchQuery: searchQuery || keywords.slice(0, 3).join(" "),
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
    descriptionEs: String(parsed.descriptionEs ?? `Detectamos: ${searchQuery}`).trim(),
  };
}

export async function analyzeProductImage(
  base64: string,
  mimeType: string,
): Promise<ImageSearchAnalysis> {
  const key = getGeminiApiKey();
  if (!key) {
    throw new ImageSearchError(
      "not_configured",
      "Búsqueda por imagen no configurada. Añade GEMINI_API_KEY en Vercel.",
    );
  }

  if (!mimeType.startsWith("image/")) {
    throw new ImageSearchError("invalid_image", "El archivo debe ser una imagen.");
  }

  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: VISION_PROMPT },
                  { inline_data: { mime_type: mimeType, data: base64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error(`${model}: ${res.status} ${errText.slice(0, 200)}`);
        continue;
      }

      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = new Error(`${model}: empty response`);
        continue;
      }
      return parseAnalysis(text);
    } catch (err) {
      lastError = err;
    }
  }

  throw new ImageSearchError(
    "analysis_failed",
    lastError instanceof Error ? lastError.message : "Error al analizar la imagen.",
  );
}

export function rankProductsForImageAnalysis(
  analysis: ImageSearchAnalysis,
  products: Product[],
  limit = 48,
): Product[] {
  const weightedTerms: { term: string; weight: number }[] = [];

  for (const term of analysis.searchQuery.toLowerCase().split(/\s+/).filter((t) => t.length >= 2)) {
    weightedTerms.push({ term, weight: 5 });
  }
  for (const term of analysis.productName.toLowerCase().split(/\s+/).filter((t) => t.length >= 2)) {
    weightedTerms.push({ term, weight: 4 });
  }
  if (analysis.brand) {
    weightedTerms.push({ term: analysis.brand.toLowerCase(), weight: 6 });
  }
  for (const kw of analysis.keywords) {
    weightedTerms.push({ term: kw.toLowerCase(), weight: 3 });
  }
  if (analysis.productType) {
    for (const term of analysis.productType.toLowerCase().split(/\s+/).filter((t) => t.length >= 3)) {
      weightedTerms.push({ term, weight: 2 });
    }
  }

  const scored = products
    .map((p) => {
      const haystack = [
        p.name,
        p.description,
        p.badge,
        p.category,
        ...p.keywords,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const { term, weight } of weightedTerms) {
        if (haystack.includes(term)) score += weight;
      }

      if (analysis.category && p.category === analysis.category) {
        score += 8;
      }

      if (score <= 0) return null;

      score += computeDealScore(p) * 0.15;
      score *= 0.7 + analysis.confidence * 0.3;

      return { product: p, score };
    })
    .filter(Boolean) as { product: Product; score: number }[];

  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const fallbackTerms = analysis.searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return products
      .filter((p) => {
        const hay = [p.name, ...p.keywords].join(" ").toLowerCase();
        return fallbackTerms.some((t) => hay.includes(t));
      })
      .slice(0, limit);
  }

  return scored.slice(0, limit).map((x) => x.product);
}

export const IMAGE_SEARCH_SESSION_KEY = "dh_image_search";

export type ImageSearchSession = {
  query: string;
  analysis: ImageSearchAnalysis;
  productIds: string[];
  previewUrl?: string;
  at: number;
};
