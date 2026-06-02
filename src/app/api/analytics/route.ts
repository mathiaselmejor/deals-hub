import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`analytics:${clientIp(request)}`, 80, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { event_type, payload, session_id, path } = body;

    if (!event_type || !["page_view", "product_click", "search", "image_search", "affiliate_click", "login"].includes(event_type)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("analytics_events").insert({
      event_type,
      payload: payload ?? {},
      user_id: user?.id ?? null,
      session_id: session_id ?? null,
      path: path ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isUserAdmin(user.id, user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: events } = await supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  return NextResponse.json({ events: events ?? [] });
}
