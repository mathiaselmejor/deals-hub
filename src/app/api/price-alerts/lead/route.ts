import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Alerta por email sin iniciar sesión. */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`price-alert-lead:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: { email?: string; productId?: string; targetPrice?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const productId = body.productId?.trim();
  const targetPrice = Number(body.targetPrice);

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }
  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }
  if (!targetPrice || targetPrice <= 0) {
    return NextResponse.json({ error: "targetPrice inválido" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { error } = await admin.from("price_alert_leads").upsert(
    {
      email,
      product_id: productId,
      target_price: targetPrice,
      active: true,
      notified_at: null,
    },
    { onConflict: "email,product_id" },
  );

  if (error) {
    if (/does not exist|relation/i.test(error.message)) {
      return NextResponse.json(
        {
          error: "Tabla price_alert_leads no instalada. Ejecuta supabase/user-features.sql",
          code: "schema_missing",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Te avisaremos por email cuando baje el precio." });
}
