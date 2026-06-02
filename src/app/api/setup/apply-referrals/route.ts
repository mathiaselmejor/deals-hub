import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PROJECT_REF = "xawuoysscwpkzwhkxruu";

async function runSql(token: string, sql: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${body.slice(0, 300)}`);
}

/** Aplica referrals.sql si SUPABASE_ACCESS_TOKEN está en env (protegido por CRON_SECRET). */
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

  const token = process.env.SUPABASE_ACCESS_TOKEN ?? process.env.SB_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({
      ok: false,
      message: "Sin SUPABASE_ACCESS_TOKEN. Referidos funcionan vía Storage.",
    });
  }

  const sqlPath = path.join(process.cwd(), "supabase", "referrals.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  try {
    await runSql(token, sql);
    return NextResponse.json({ ok: true, applied: "referrals.sql" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
