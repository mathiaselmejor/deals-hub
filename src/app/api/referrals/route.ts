import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateReward,
  generateReferralCode,
  REFERRAL_MIN_SALES,
} from "@/lib/referrals";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let { data: profile } = await supabase
    .from("referral_profiles")
    .select("code, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const code = generateReferralCode(user.id);
    const { data: created, error } = await supabase
      .from("referral_profiles")
      .insert({ user_id: user.id, code })
      .select("code, created_at")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    profile = created;
  }

  const { data: conversions } = await supabase
    .from("referral_conversions")
    .select("commission_eur, status")
    .eq("code", profile.code);

  const confirmed = (conversions ?? []).filter((c) => c.status === "confirmed");
  const pending = (conversions ?? []).filter((c) => c.status === "pending");
  const gross = confirmed.reduce((s, c) => s + Number(c.commission_eur ?? 0), 0);
  const reward = calculateReward(gross, confirmed.length);

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://deals-hub-iota.vercel.app";
  const shareUrl = `${site}/?ref=${profile.code}`;

  return NextResponse.json({
    code: profile.code,
    shareUrl,
    minSales: REFERRAL_MIN_SALES,
    confirmedSales: confirmed.length,
    pendingSales: pending.length,
    grossCommissionEur: gross,
    reward,
  });
}
