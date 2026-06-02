import affiliateConfig from "../../data/affiliate-config.json";
import type { ProductOffer, StoreId } from "./types";

type AffiliateEnv = {
  amazonTag?: string;
  awinPublisherId?: string;
  ebayCampaignId?: string;
  aliexpressShortKey?: string;
  aliexpressTrackingName?: string;
  bookingAid?: string;
  admitadId?: string;
  tradetrackerId?: string;
};

/** Código corto del generador de enlaces (ej. _c3iyuOdJ o URL completa s.click). */
export function normalizeAliexpressShortKey(raw: string): string {
  const trimmed = raw.trim();
  const fromUrl = trimmed.match(/s\.click\.aliexpress\.com\/(e\/_[A-Za-z0-9]+)/i);
  if (fromUrl) return fromUrl[1].replace(/^e\//, "");
  if (trimmed.startsWith("e/_")) return trimmed.slice(2);
  if (trimmed.startsWith("_")) return trimmed;
  return `_${trimmed}`;
}

/** IDs Awin de comerciantes en España (para enlaces de afiliado correctos) */
const AWIN_MERCHANT_IDS: Partial<Record<StoreId, string>> = {
  pccomponentes: "20982",
  elcorteingles: "13075",
  fnac: "77630",
  decathlon: "105405",
  // MediaMarkt ES no tiene programa activo en Awin; IKEA: verificar en panel
  mediamarkt: "2549",
  ikea: "22455",
};

function getEnv(): AffiliateEnv {
  return {
    amazonTag: process.env.NEXT_PUBLIC_AMAZON_TAG?.trim() || undefined,
    awinPublisherId: process.env.NEXT_PUBLIC_AWIN_PUBLISHER_ID?.trim() || undefined,
    ebayCampaignId: process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID?.trim() || undefined,
    aliexpressShortKey: process.env.NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID?.trim() || undefined,
    aliexpressTrackingName:
      process.env.NEXT_PUBLIC_ALIEXPRESS_TRACKING_NAME?.trim() || "default",
    bookingAid: process.env.NEXT_PUBLIC_BOOKING_AID?.trim() || undefined,
    admitadId: process.env.NEXT_PUBLIC_ADMITAD_ID?.trim() || undefined,
    tradetrackerId: process.env.NEXT_PUBLIC_TRADETRACKER_ID?.trim() || undefined,
  };
}

function appendTrackingParams(url: string, productId: string, store: StoreId): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "dealshub");
    u.searchParams.set("utm_medium", "affiliate");
    u.searchParams.set("utm_campaign", productId);
    u.searchParams.set("utm_content", store);
    return u.toString();
  } catch {
    return url;
  }
}

export function isAffiliateConfigured(): boolean {
  const env = getEnv();
  return !!(env.amazonTag || env.awinPublisherId || env.ebayCampaignId || env.aliexpressShortKey);
}

export function getAffiliateStatus(): Record<string, boolean> {
  const env = getEnv();
  return {
    amazon: !!env.amazonTag,
    awin: !!env.awinPublisherId,
    ebay: !!env.ebayCampaignId,
    aliexpress: !!env.aliexpressShortKey,
    booking: !!env.bookingAid,
  };
}

export function buildAffiliateUrl(offer: ProductOffer, productId?: string): string {
  const env = getEnv();
  const pid = productId ?? "unknown";
  const base = offer.url;

  if (offer.store === "amazon" && env.amazonTag) {
    try {
      const url = new URL(base);
      url.searchParams.set("tag", env.amazonTag);
      url.searchParams.set("linkCode", "ll1");
      url.searchParams.set("linkId", pid.slice(0, 20));
      return appendTrackingParams(url.toString(), pid, offer.store);
    } catch {
      return base;
    }
  }

  const awinMid = AWIN_MERCHANT_IDS[offer.store];
  if (env.awinPublisherId && awinMid) {
    const dest = appendTrackingParams(base, pid, offer.store);
    const clickref = encodeURIComponent(`dealshub_${pid.slice(0, 40)}`);
    return `https://www.awin1.com/cread.php?awinmid=${awinMid}&awinaffid=${env.awinPublisherId}&clickref=${clickref}&ued=${encodeURIComponent(dest)}`;
  }

  if (offer.store === "ebay" && env.ebayCampaignId) {
    return `https://rover.ebay.com/rover/1/${env.ebayCampaignId}/1?mpre=${encodeURIComponent(appendTrackingParams(base, pid, offer.store))}`;
  }

  if (offer.store === "aliexpress" && env.aliexpressShortKey) {
    const shortKey = normalizeAliexpressShortKey(env.aliexpressShortKey);
    const dest = appendTrackingParams(base, pid, offer.store);
    const af = `dealshub_${pid.slice(0, 36)}`;
    return `https://s.click.aliexpress.com/deep_link.htm?aff_short_key=${encodeURIComponent(shortKey)}&dl_target_url=${encodeURIComponent(dest)}&af=${encodeURIComponent(af)}`;
  }

  if (offer.store === "booking" && env.bookingAid) {
    try {
      const url = new URL(base);
      url.searchParams.set("aid", env.bookingAid);
      url.searchParams.set("label", `dealshub-${pid}`);
      return url.toString();
    } catch {
      return base;
    }
  }

  return appendTrackingParams(base, pid, offer.store);
}

export function getAffiliateDisclaimer(): string {
  return (affiliateConfig as { disclaimer: string }).disclaimer;
}
