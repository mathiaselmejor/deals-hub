import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { priceAlertLeadsTableAvailable, priceAlertsTableAvailable } from "@/lib/user-features";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "xawuoysscwpkzwhkxruu";

async function runSql(query: string): Promise<{ ok: boolean; status: number; body: string }> {
  const token = process.env.SB_ACCESS_TOKEN ?? process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    return { ok: false, status: 503, body: "missing_management_token" };
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body: body.slice(0, 500) };
}

export async function GET() {
  const alerts = await priceAlertsTableAvailable();
  const leads = await priceAlertLeadsTableAvailable();
  return NextResponse.json({
    priceAlerts: alerts,
    priceAlertLeads: leads,
    managementToken: !!(process.env.SB_ACCESS_TOKEN ?? process.env.SUPABASE_ACCESS_TOKEN),
  });
}

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

  const root = process.cwd();
  const files = [
    "supabase/price-alert-leads-migration.sql",
    "supabase/user-features.sql",
  ];
  const results: { file: string; ok: boolean; detail: string }[] = [];

  for (const file of files) {
    const path = join(root, file);
    let query: string;
    try {
      query = readFileSync(path, "utf-8");
    } catch {
      results.push({ file, ok: false, detail: "file_not_found" });
      continue;
    }
    const r = await runSql(query);
    results.push({ file, ok: r.ok, detail: r.ok ? "applied" : `${r.status}: ${r.body}` });
    if (!r.ok && r.status === 503) break;
  }

  const alerts = await priceAlertsTableAvailable();
  const leads = await priceAlertLeadsTableAvailable();

  return NextResponse.json({
    ok: alerts && leads,
    priceAlerts: alerts,
    priceAlertLeads: leads,
    results,
  });
}
