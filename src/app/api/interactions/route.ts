import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`interactions:${clientIp(request)}`, 100, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { signalType, productId, sessionId, payload } = body;

    if (!signalType || !["view", "click", "search", "favorite"].includes(signalType)) {
      return NextResponse.json({ error: "Invalid signalType" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("user_signals").insert({
      user_id: user?.id ?? null,
      session_id: sessionId ?? null,
      signal_type: signalType,
      product_id: productId ?? null,
      payload: payload ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
