import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateAlertStatus } from "@/lib/price-alerts-engine";
import { getProductById } from "@/lib/products";

export const dynamic = "force-dynamic";

/** Estado en vivo de las alertas del usuario (para panel y badges). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("price_alerts")
    .select("product_id, target_price, notified_at, price_at_create")
    .eq("user_id", user.id)
    .eq("active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((row) => {
    const target = Number(row.target_price);
    const status = evaluateAlertStatus(row.product_id, target, row.notified_at);
    const product = getProductById(row.product_id);
    return {
      productId: row.product_id,
      productName: product?.name ?? row.product_id,
      targetPrice: target,
      priceAtCreate: row.price_at_create ? Number(row.price_at_create) : null,
      notifiedAt: row.notified_at,
      ...status,
    };
  });

  const hits = items.filter((i) => i.hit);

  return NextResponse.json({
    alerts: items,
    hits,
    hitCount: hits.length,
  });
}
