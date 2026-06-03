"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PriceAlertButton } from "@/components/PriceAlertButton";

export function FavoriteButton({ productId }: { productId: string }) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
      if (user) {
        fetch("/api/favorites")
          .then((r) => r.json())
          .then((d) => {
            const ids = (d.favorites ?? []).map((f: { product_id: string }) => f.product_id);
            setActive(ids.includes(productId));
          })
          .catch(() => {});
      }
    });
  }, [productId]);

  const toggle = async () => {
    if (!loggedIn) {
      window.location.href = `/login?redirect=/producto/${productId}`;
      return;
    }
    setLoading(true);
    const method = active ? "DELETE" : "POST";
    await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setActive(!active);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={loggedIn === false ? "Inicia sesión para guardar" : active ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
        active
          ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      {loading ? "..." : active ? "♥ Guardado" : "♡ Favorito"}
    </button>
  );
}

export function ProductActions({
  productId,
  productName,
  currentPrice,
}: {
  productId: string;
  productName: string;
  currentPrice: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <FavoriteButton productId={productId} />
        <Link
          href="/cuenta"
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:text-white"
        >
          Mis alertas →
        </Link>
      </div>
      <PriceAlertButton
        productId={productId}
        currentPrice={currentPrice}
        productName={productName}
      />
    </div>
  );
}
