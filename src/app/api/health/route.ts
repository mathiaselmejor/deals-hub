import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getAffiliateStatus,
  getAliExpressMonetizationStatus,
  isAffiliateConfigured,
} from "@/lib/affiliate";
import { getAliExpressLinkMapSize } from "@/lib/aliexpress-links";
import { referralsSqlAvailable } from "@/lib/referrals-store";
import { getAliExpressProducts, getCatalog } from "@/lib/products";
import { isImageSearchConfigured } from "@/lib/image-search";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = getCatalog();
  const affiliate = getAffiliateStatus();
  const aliexpressMeta = getAliExpressMonetizationStatus();
  const aliexpressProducts = getAliExpressProducts();

  const amazonDirect = catalog.products.filter((p) => {
    const am = p.offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished");
    return am?.linkKind === "direct";
  }).length;

  const aliexpressDirect = aliexpressProducts.filter((p) => {
    const ae = p.offers.find((o) => o.store === "aliexpress");
    return ae?.linkKind === "direct";
  }).length;

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

  const monetization = {
    amazon: affiliate.amazon,
    awin: affiliate.awin,
    aliexpress: affiliate.aliexpress,
    ebay: affiliate.ebay,
    booking: affiliate.booking,
    /** Redes principales activas para generar comisión en España */
    coreNetworksReady: affiliate.amazon && affiliate.awin && affiliate.aliexpress,
  };

  const checks = {
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://deals-hub-iota.vercel.app",
    catalogProducts: catalog.products.length,
    amazonDirectLinks: amazonDirect,
    aliexpressProducts: aliexpressProducts.length,
    aliexpressDirectLinks: aliexpressDirect,
    aliexpressLinkMap: getAliExpressLinkMapSize(),
    aliexpressPortals: aliexpressMeta,
    awinPublisherId: process.env.NEXT_PUBLIC_AWIN_PUBLISHER_ID ? "configured" : "missing",
    awinStores: ["pccomponentes", "elcorteingles", "fnac", "decathlon", "backmarket", "lg", "casadellibro"],
    affiliateConfigured: isAffiliateConfigured(),
    affiliate,
    monetization,
    cronSecretConfigured: !!process.env.CRON_SECRET,
    supabase,
    referralsSql,
    referralsStorage,
    referralsWorking: referralsSql || referralsStorage,
    catalogRefresh: "github-actions-every-6h",
    imageSearch: isImageSearchConfigured(),
  };

  const allOk =
    checks.catalogProducts > 400 &&
    checks.amazonDirectLinks > 400 &&
    checks.aliexpressProducts >= 6 &&
    monetization.coreNetworksReady &&
    checks.cronSecretConfigured &&
    checks.supabase &&
    checks.referralsWorking;

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    checks,
    updatedAt: new Date().toISOString(),
  });
}
