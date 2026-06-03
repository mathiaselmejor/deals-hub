import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  const supabase = createServiceClient();
  await supabase.from("newsletter_subscribers").update({ active: false }).eq("email", email);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://deals-hub-iota.vercel.app";

  return NextResponse.redirect(`${siteUrl}/?newsletter=unsubscribed`);
}
