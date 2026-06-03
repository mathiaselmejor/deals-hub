import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getBestDealsToday } from "@/lib/algorithms";
import { getDisplayPrice, getDisplayDiscount } from "@/lib/products";
import { isEmailConfigured, sendWeeklyNewsletterEmail } from "@/lib/notify-email";

export const maxDuration = 120;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://deals-hub-iota.vercel.app";

/** Vercel Cron — lunes 9:00 UTC (10:00 CET invierno) */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  if (auth !== `Bearer ${secret}` && headerSecret !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: false, error: "email_not_configured" }, { status: 503 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = createServiceClient();
  const { data: subs, error } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("active", true)
    .limit(500);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const deals = getBestDealsToday(8).map((p) => ({
    name: p.name,
    price: getDisplayPrice(p),
    discount: getDisplayDiscount(p),
    url: `${siteUrl}/producto/${p.id}`,
  }));

  let sent = 0;
  let failed = 0;
  for (const row of subs ?? []) {
    const result = await sendWeeklyNewsletterEmail({
      to: row.email,
      deals,
      siteUrl,
      unsubscribeUrl: `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(row.email)}`,
    });
    if (result.ok) sent++;
    else failed++;
    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json({ ok: true, subscribers: subs?.length ?? 0, sent, failed, deals: deals.length });
}

export async function GET(request: Request) {
  return POST(request);
}
