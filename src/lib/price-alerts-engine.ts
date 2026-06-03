import { getProductById, getLowestPrice } from "@/lib/products";
import { sendPriceAlertEmail, isEmailConfigured } from "@/lib/notify-email";
import { createServiceClient } from "@/lib/supabase/admin";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://deals-hub-iota.vercel.app";

export type PriceAlertRow = {
  id: number;
  user_id: string;
  product_id: string;
  target_price: number;
  active: boolean;
  notified_at: string | null;
  price_at_create: number | null;
  created_at: string;
};

export type PriceAlertLeadRow = {
  id: number;
  email: string;
  product_id: string;
  target_price: number;
  active: boolean;
  notified_at: string | null;
  created_at: string;
};

function currentCatalogPrice(productId: string): number {
  const p = getProductById(productId);
  if (!p) return 0;
  return getLowestPrice(p) || p.price || 0;
}

function shouldNotify(current: number, target: number, notifiedAt: string | null): boolean {
  if (current <= 0 || current > target) return false;
  return !notifiedAt;
}

function shouldResetNotify(current: number, target: number): boolean {
  return current > target * 1.03;
}

export async function processPriceAlerts(): Promise<{
  checked: number;
  triggered: number;
  emailed: number;
  reset: number;
  missingProducts: number;
  emailConfigured: boolean;
  errors: string[];
}> {
  const admin = createServiceClient();
  const errors: string[] = [];
  let triggered = 0;
  let emailed = 0;
  let reset = 0;
  let missingProducts = 0;
  const emailConfigured = isEmailConfigured();

  const { data: alerts, error: alertsErr } = await admin
    .from("price_alerts")
    .select("id, user_id, product_id, target_price, active, notified_at, price_at_create, created_at")
    .eq("active", true);

  if (alertsErr) {
    return {
      checked: 0,
      triggered: 0,
      emailed: 0,
      reset: 0,
      missingProducts: 0,
      emailConfigured,
      errors: [alertsErr.message],
    };
  }

  const rows = (alerts ?? []) as PriceAlertRow[];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const emailByUser = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      if (p.email) emailByUser.set(p.id, p.email);
    }
  }

  for (const alert of rows) {
    const current = currentCatalogPrice(alert.product_id);
    if (current <= 0) {
      missingProducts++;
      continue;
    }

    if (shouldResetNotify(current, Number(alert.target_price))) {
      if (alert.notified_at) {
        await admin
          .from("price_alerts")
          .update({ notified_at: null })
          .eq("id", alert.id);
        reset++;
      }
      continue;
    }

    if (!shouldNotify(current, Number(alert.target_price), alert.notified_at)) {
      continue;
    }

    triggered++;
    const product = getProductById(alert.product_id);
    const productName = product?.name ?? alert.product_id;
    const productUrl = `${siteUrl}/producto/${alert.product_id}`;

    const userEmail = emailByUser.get(alert.user_id);
    if (userEmail && emailConfigured) {
      const sent = await sendPriceAlertEmail({
        to: userEmail,
        productName,
        productUrl,
        targetPrice: Number(alert.target_price),
        currentPrice: current,
      });
      if (sent.ok) emailed++;
      else if (sent.error) errors.push(`user ${alert.user_id}: ${sent.error}`);
    }

    await admin
      .from("price_alerts")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", alert.id);
  }

  const { data: leads, error: leadsErr } = await admin
    .from("price_alert_leads")
    .select("*")
    .eq("active", true);

  if (!leadsErr && leads) {
    for (const lead of leads as PriceAlertLeadRow[]) {
      const current = currentCatalogPrice(lead.product_id);
      if (current <= 0) {
        missingProducts++;
        continue;
      }

      if (shouldResetNotify(current, Number(lead.target_price))) {
        if (lead.notified_at) {
          await admin
            .from("price_alert_leads")
            .update({ notified_at: null })
            .eq("id", lead.id);
          reset++;
        }
        continue;
      }

      if (!shouldNotify(current, Number(lead.target_price), lead.notified_at)) {
        continue;
      }

      triggered++;
      const product = getProductById(lead.product_id);
      const productName = product?.name ?? lead.product_id;
      const productUrl = `${siteUrl}/producto/${lead.product_id}?ref=alert`;

      if (emailConfigured) {
        const sent = await sendPriceAlertEmail({
          to: lead.email,
          productName,
          productUrl,
          targetPrice: Number(lead.target_price),
          currentPrice: current,
        });
        if (sent.ok) emailed++;
        else if (sent.error) errors.push(`lead ${lead.email}: ${sent.error}`);
      }

      await admin
        .from("price_alert_leads")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", lead.id);
    }
  }

  return {
    checked: rows.length + (leads?.length ?? 0),
    triggered,
    emailed,
    reset,
    missingProducts,
    emailConfigured,
    errors,
  };
}

export function evaluateAlertStatus(
  productId: string,
  targetPrice: number,
  notifiedAt: string | null,
): {
  currentPrice: number;
  hit: boolean;
  percentToTarget: number | null;
  canNotifyAgain: boolean;
} {
  const currentPrice = currentCatalogPrice(productId);
  const hit = currentPrice > 0 && currentPrice <= targetPrice;
  const percentToTarget =
    currentPrice > 0 && targetPrice > 0
      ? Math.round(((currentPrice - targetPrice) / targetPrice) * 100)
      : null;
  const canNotifyAgain = hit && !notifiedAt;
  return { currentPrice, hit, percentToTarget, canNotifyAgain };
}
