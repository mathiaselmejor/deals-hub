import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`newsletter:${ip}`, 5, 3600_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email, active: true },
    { onConflict: "email" },
  );

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Tabla newsletter pendiente — ejecuta supabase/user-features.sql" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
