import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPersonalizedRecommendations } from "@/lib/algorithms";
import type { UserSignal } from "@/lib/algorithms";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const { getBestDealsToday } = await import("@/lib/algorithms");
    return NextResponse.json({
      products: getBestDealsToday(8).map((p) => p.id),
      personalized: false,
    });
  }

  const [{ data: signals }, { data: favorites }] = await Promise.all([
    supabase
      .from("user_signals")
      .select("signal_type, product_id, payload")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("favorites").select("product_id").eq("user_id", user.id),
  ]);

  const userSignals: UserSignal[] = (signals ?? []).map((s) => ({
    signalType: s.signal_type as UserSignal["signalType"],
    productId: s.product_id ?? undefined,
    payload: s.payload as UserSignal["payload"],
  }));

  const favoriteIds = (favorites ?? []).map((f) => f.product_id);
  const products = getPersonalizedRecommendations(userSignals, favoriteIds, 8);

  return NextResponse.json({
    products: products.map((p) => p.id),
    personalized: true,
  });
}
