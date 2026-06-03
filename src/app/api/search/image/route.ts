import { NextResponse } from "next/server";
import {
  analyzeProductImage,
  ImageSearchError,
  getGeminiApiKey,
  rankProductsForImageAnalysis,
} from "@/lib/image-search";
import { analyzeImageWithOcr } from "@/lib/image-search-ocr";
import { getCatalog } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET() {
  const vision = !!getGeminiApiKey();
  return NextResponse.json({
    configured: true,
    vision,
    ocr: true,
    maxSizeMb: 4,
    formats: ["jpeg", "png", "webp", "gif"],
  });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`image-search:${ip}`, 15, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas búsquedas por imagen. Espera un momento.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta la imagen.", code: "invalid_image" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato no soportado. Usa JPG, PNG o WebP.", code: "invalid_image" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Imagen demasiado grande (máx. 4 MB).", code: "invalid_image" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const useVision = !!getGeminiApiKey();
    const analysis = useVision
      ? await analyzeProductImage(buffer.toString("base64"), file.type)
      : await analyzeImageWithOcr(buffer);

    const { products } = getCatalog();
    const ranked = rankProductsForImageAnalysis(analysis, products);

    return NextResponse.json({
      query: analysis.searchQuery,
      analysis,
      productIds: ranked.map((p) => p.id),
      count: ranked.length,
      mode: useVision ? "vision" : "ocr",
    });
  } catch (err) {
    if (err instanceof ImageSearchError) {
      const status = err.code === "not_configured" ? 503 : 422;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    return NextResponse.json(
      { error: "No pudimos analizar la imagen. Prueba otra foto.", code: "analysis_failed" },
      { status: 500 },
    );
  }
}
