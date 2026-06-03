import type { ImageSearchAnalysis, ImageSearchSession } from "./image-search";
import { IMAGE_SEARCH_SESSION_KEY } from "./image-search";
import { buildQueryFromOcr } from "./image-search-ocr";

export { buildQueryFromOcr };

export async function resizeImageForUpload(
  file: File,
  maxEdge = 1280,
): Promise<File> {
  if (typeof createImageBitmap === "undefined") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.88);
  });
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg") || "photo.jpg", {
    type: "image/jpeg",
  });
}

export function saveImageSearchSession(session: Omit<ImageSearchSession, "at">): void {
  if (typeof window === "undefined") return;
  const payload: ImageSearchSession = { ...session, at: Date.now() };
  sessionStorage.setItem(IMAGE_SEARCH_SESSION_KEY, JSON.stringify(payload));
}

export function loadImageSearchSession(): ImageSearchSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(IMAGE_SEARCH_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ImageSearchSession;
    if (Date.now() - data.at > 30 * 60_000) {
      sessionStorage.removeItem(IMAGE_SEARCH_SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearImageSearchSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(IMAGE_SEARCH_SESSION_KEY);
}

export type ImageSearchApiResponse = {
  query: string;
  analysis: ImageSearchAnalysis;
  productIds: string[];
  count: number;
};

/** OCR local — fallback sin API key (lee texto en cajas/etiquetas). */
export async function extractTextFromImage(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("spa+eng");
  try {
    const { data } = await worker.recognize(file);
    return data.text.replace(/\s+/g, " ").trim();
  } finally {
    await worker.terminate();
  }
}

export async function searchByImageFile(file: File): Promise<ImageSearchApiResponse> {
  const prepared = await resizeImageForUpload(file);
  const form = new FormData();
  form.append("image", prepared);

  const res = await fetch("/api/search/image", { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Error en búsqueda por imagen");
  }

  return data as ImageSearchApiResponse;
}
