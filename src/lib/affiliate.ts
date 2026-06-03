import affiliateConfig from "../../data/affiliate-config.json";
import { getAwinMerchantMap, buildAwinAffiliateUrl, getAwinPublisherId } from "./awin-programs";
import {
  buildTradedoublerAffiliateUrl,
  getTradedoublerProgramId,
  getTradedoublerSiteId,
  type TradedoublerStoreId,
} from "./tradedoubler";
import { amazonProductUrl, extractAmazonAsin } from "./direct-links";
import { appendInternalTracking, getOfferTargetUrl } from "./offer-target";
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
  tradedoublerSiteId?: string;
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

/** IDs Awin verificados — ver data/awin-programs-es.json */
const AWIN_MERCHANT_IDS = getAwinMerchantMap();

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
    tradedoublerSiteId: getTradedoublerSiteId(),
  };
}

function appendTrackingParams(url: string, productId: string, store: StoreId): string {
  return appendInternalTracking(url, productId, store);
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
    tradedoubler: !!env.tradedoublerSiteId,
  };
}

/** Estado AliExpress Portals para panel admin / health. */
export function getAliExpressMonetizationStatus(): {
  configured: boolean;
  trackingId: string | null;
  trackingName: string;
  deepLinkFormat: string;
} {
  const env = getEnv();
  const raw = env.aliexpressShortKey ?? null;
  return {
    configured: !!raw,
    trackingId: raw ? `${normalizeAliexpressShortKey(raw).slice(0, 4)}…` : null,
    trackingName: env.aliexpressTrackingName ?? "default",
    deepLinkFormat: "s.click.aliexpress.com/deep_link.htm",
  };
}

export function buildAffiliateUrl(offer: ProductOffer, productId?: string): string {
  const env = getEnv();
  const pid = productId ?? "unknown";
  const target = getOfferTargetUrl(offer);

  if (offer.store === "amazon" && env.amazonTag) {
    try {
      const asin =
        offer.asin ?? extractAmazonAsin(target) ?? extractAmazonAsin(offer.url);
      const base = asin ? amazonProductUrl(asin) : target;
      const url = new URL(base);
      url.searchParams.set("tag", env.amazonTag);
      return url.toString();
    } catch {
      return target;
    }
  }

  const awinMid = AWIN_MERCHANT_IDS[offer.store];
  const publisherId = getAwinPublisherId();
  if (env.awinPublisherId && awinMid && publisherId) {
    const dest = appendTrackingParams(target, pid, offer.store);
    const clickref = `dealshub_${pid.slice(0, 40)}`;
    return buildAwinAffiliateUrl(awinMid, dest, env.awinPublisherId, clickref);
  }

  if (offer.store === "ebay" && env.ebayCampaignId) {
    return `https://rover.ebay.com/rover/1/${env.ebayCampaignId}/1?mpre=${encodeURIComponent(appendTrackingParams(target, pid, offer.store))}`;
  }

  if (offer.store === "aliexpress" && env.aliexpressShortKey) {
    const shortKey = normalizeAliexpressShortKey(env.aliexpressShortKey);
    const dest = appendTrackingParams(target, pid, offer.store);
    const traceKey = `dealshub_${pid.slice(0, 32)}`;
    const params = new URLSearchParams({
      aff_short_key: shortKey,
      dl_target_url: dest,
      aff_trace_key: traceKey,
    });
    return `https://s.click.aliexpress.com/deep_link.htm?${params.toString()}`;
  }

  if (offer.store === "booking" && env.bookingAid) {
    try {
      const url = new URL(target);
      url.searchParams.set("aid", env.bookingAid);
      url.searchParams.set("label", `dealshub-${pid}`);
      return url.toString();
    } catch {
      return target;
    }
  }

  const tdSiteId = env.tradedoublerSiteId;
  if (tdSiteId && offer.store === "mediamarkt") {
    const programId = getTradedoublerProgramId(offer.store as TradedoublerStoreId);
    const dest = appendTrackingParams(target, pid, offer.store);
    const clickRef = `dealshub_${pid.slice(0, 40)}`;
    return buildTradedoublerAffiliateUrl(programId, tdSiteId, dest, clickRef);
  }

  return appendTrackingParams(target, pid, offer.store);
}

export function getAffiliateDisclaimer(): string {
  return (affiliateConfig as { disclaimer: string }).disclaimer;
}
