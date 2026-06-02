import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getAffiliateStatus, isAffiliateConfigured } from "@/lib/affiliate";
import { referralsSqlAvailable } from "@/lib/referrals-store";
import { getCatalog } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = getCatalog();
  const affiliate = getAffiliateStatus();
  const amazonDirect = catalog.products.filter((p) => {
    const am = p.offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished");
    return am?.linkKind === "direct";
  }).length;
  const aliexpressOffers = catalog.products.filter((p) =>
    p.offers.some((o) => o.store === "aliexpress"),
  ).length;

  let supabase = false;
  let referralsSql = false;
  let referralsStorage = false;

  try {
    const admin = createServiceClient();
    const { error } = await admin.from("analytics_events").select("id").limit(1);
    supabase = !error;
    referralsSql = await referralsSqlAvailable();
    const { data: buckets } = await admin.storage.listBuckets();
    referralsStorage = buckets?.some((b) => b.name === "deals-hub-data") ?? false;
  } catch {
    supabase = false;
  }

  const checks = {
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://deals-hub-iota.vercel.app",
    catalogProducts: catalog.products.length,
    amazonDirectLinks: amazonDirect,
    aliexpressOffers,
    affiliateConfigured: isAffiliateConfigured(),
    affiliate,
    cronSecretConfigured: !!process.env.CRON_SECRET,
    supabase,
    referralsSql,
    referralsStorage,
    referralsWorking: referralsSql || referralsStorage,
    catalogRefresh: "github-actions-every-6h",
  };

  const allOk =
    checks.catalogProducts > 400 &&
    checks.amazonDirectLinks > 400 &&
    checks.cronSecretConfigured &&
    checks.supabase &&
    checks.referralsWorking;

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    checks,
    updatedAt: new Date().toISOString(),
  });
}
