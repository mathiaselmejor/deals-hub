import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`ref-click:${clientIp(request)}`, 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code || code.length > 32) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("referral_clicks").insert({
    code,
    session_id: body.sessionId ?? null,
    landing_path: body.path ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, skipped: true });
  }

  return NextResponse.json({ ok: true });
}
