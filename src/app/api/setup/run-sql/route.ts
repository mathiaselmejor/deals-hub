import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Migración idempotente de tablas referidos vía RPC si existe, o verificación REST.
 * Protegido por CRON_SECRET (mismo que cron de catálogo).
 */
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("referral_profiles").select("code").limit(1);

  if (!error) {
    return NextResponse.json({ ok: true, status: "referrals_already_installed" });
  }

  if (error.code !== "PGRST205" && !/does not exist|relation/i.test(error.message)) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: false,
    status: "needs_sql_migration",
    message:
      "Ejecuta supabase/referrals.sql con: node scripts/apply-sql-file.mjs supabase/referrals.sql (requiere SB_ACCESS_TOKEN) o pega el SQL en el panel Supabase.",
    dashboardSql: `https://supabase.com/dashboard/project/xawuoysscwpkzwhkxruu/sql/new`,
  });
}
