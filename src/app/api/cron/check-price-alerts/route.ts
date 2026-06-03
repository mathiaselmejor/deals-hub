import { NextResponse } from "next/server";
import { processPriceAlerts } from "@/lib/price-alerts-engine";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Vercel Cron: comprueba precios del catálogo y envía emails (Resend). */
export async function GET(request: Request) {
  return runCheck(request);
}

export async function POST(request: Request) {
  return runCheck(request);
}

async function runCheck(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  if (auth !== `Bearer ${secret}` && headerSecret !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await processPriceAlerts();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "check_failed" },
      { status: 500 },
    );
  }
}
