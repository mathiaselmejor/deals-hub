import type { ImageSearchAnalysis } from "./image-search";
import { ImageSearchError } from "./image-search";

export function buildQueryFromOcr(text: string): string | null {
  const cleaned = text
    .replace(/[^\w\sáéíóúñüÁÉÍÓÚÑÜ%+\-/]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 4) return null;
  const words = cleaned.split(" ").filter((w) => w.length >= 3);
  return words.length ? words.slice(0, 8).join(" ") : null;
}

export function analysisFromOcrQuery(query: string): ImageSearchAnalysis {
  return {
    productType: "texto detectado",
    productName: query,
    brand: null,
    category: null,
    keywords: query.split(" ").filter(Boolean),
    searchQuery: query,
    confidence: 0.55,
    descriptionEs: `Leímos texto en la imagen: «${query}»`,
  };
}

/** OCR en servidor (fallback sin GEMINI_API_KEY). */
export async function analyzeImageWithOcr(buffer: Buffer): Promise<ImageSearchAnalysis> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("spa+eng", undefined, {
    logger: () => {},
  });
  try {
    const { data } = await worker.recognize(buffer);
    const query = buildQueryFromOcr(data.text.replace(/\s+/g, " ").trim());
    if (!query) {
      throw new ImageSearchError(
        "analysis_failed",
        "No leímos texto en la imagen. Prueba una foto con etiqueta, marca o nombre visible, o configura GEMINI_API_KEY para visión IA.",
      );
    }
    return analysisFromOcrQuery(query);
  } finally {
    await worker.terminate();
  }
}
