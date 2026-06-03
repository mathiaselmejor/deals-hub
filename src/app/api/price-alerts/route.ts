import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateAlertStatus } from "@/lib/price-alerts-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productId = new URL(request.url).searchParams.get("productId")?.trim();

  let query = supabase
    .from("price_alerts")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const alerts = data ?? [];
  if (productId && alerts[0]) {
    const row = alerts[0];
    const status = evaluateAlertStatus(
      row.product_id,
      Number(row.target_price),
      row.notified_at,
    );
    return NextResponse.json({ alert: row, ...status });
  }

  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const productId = body.productId?.trim();
  const targetPrice = Number(body.targetPrice);
  const priceAtCreate = body.priceAtCreate != null ? Number(body.priceAtCreate) : null;

  if (!productId || !targetPrice || targetPrice <= 0) {
    return NextResponse.json({ error: "productId and targetPrice required" }, { status: 400 });
  }

  const { error } = await supabase.from("price_alerts").upsert(
    {
      user_id: user.id,
      product_id: productId,
      target_price: targetPrice,
      price_at_create: priceAtCreate,
      active: true,
      notified_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" },
  );

  if (error) {
    if (/does not exist|relation/i.test(error.message)) {
      return NextResponse.json(
        { error: "Ejecuta supabase/user-features.sql en tu proyecto Supabase", code: "schema_missing" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const status = evaluateAlertStatus(productId, targetPrice, null);
  return NextResponse.json({ ok: true, ...status });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, targetPrice } = await request.json();
  if (!productId || targetPrice == null) {
    return NextResponse.json({ error: "productId and targetPrice required" }, { status: 400 });
  }

  const price = Number(targetPrice);
  if (price <= 0) {
    return NextResponse.json({ error: "targetPrice inválido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("price_alerts")
    .update({
      target_price: price,
      notified_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, ...evaluateAlertStatus(productId, price, null) });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const { error } = await supabase
    .from("price_alerts")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
