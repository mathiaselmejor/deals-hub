import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateReward,
  generateReferralCode,
  REFERRAL_MIN_SALES,
} from "@/lib/referrals";
import {
  referralsSqlAvailable,
  storageGetConversions,
  storageGetProfile,
  storageUpsertProfile,
} from "@/lib/referrals-store";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const useSql = await referralsSqlAvailable();
  let code: string;

  if (useSql) {
    let { data: profile } = await supabase
      .from("referral_profiles")
      .select("code, created_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      const newCode = generateReferralCode(user.id);
      const { data: created, error } = await supabase
        .from("referral_profiles")
        .insert({ user_id: user.id, code: newCode })
        .select("code, created_at")
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      profile = created;
    }
    code = profile.code;

    const { data: conversions } = await supabase
      .from("referral_conversions")
      .select("commission_eur, status")
      .eq("code", code);

    const confirmed = (conversions ?? []).filter((c) => c.status === "confirmed");
    const pending = (conversions ?? []).filter((c) => c.status === "pending");
    const gross = confirmed.reduce((s, c) => s + Number(c.commission_eur ?? 0), 0);
    const reward = calculateReward(gross, confirmed.length);

    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "https://deals-hub-iota.vercel.app";

    return NextResponse.json({
      code,
      shareUrl: `${site}/?ref=${code}`,
      minSales: REFERRAL_MIN_SALES,
      confirmedSales: confirmed.length,
      pendingSales: pending.length,
      grossCommissionEur: gross,
      reward,
      backend: "sql",
    });
  }

  let profile = await storageGetProfile(user.id);
  if (!profile) {
    profile = await storageUpsertProfile(user.id, generateReferralCode(user.id));
  }
  code = profile.code;

  const conversions = await storageGetConversions(code);
  const confirmed = conversions.filter((c) => c.status === "confirmed");
  const pending = conversions.filter((c) => c.status === "pending");
  const gross = confirmed.reduce((s, c) => s + Number(c.commissionEur ?? 0), 0);
  const reward = calculateReward(gross, confirmed.length);

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://deals-hub-iota.vercel.app";

  return NextResponse.json({
    code,
    shareUrl: `${site}/?ref=${code}`,
    minSales: REFERRAL_MIN_SALES,
    confirmedSales: confirmed.length,
    pendingSales: pending.length,
    grossCommissionEur: gross,
    reward,
    backend: "storage",
  });
}
