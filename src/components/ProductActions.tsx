"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

export function PriceAlertButton({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
  }, []);

  const suggested = currentPrice > 0 ? Math.floor(currentPrice * 0.9) : 0;

  const save = async () => {
    if (!loggedIn) {
      window.location.href = `/login?redirect=/producto/${productId}`;
      return;
    }
    const price = parseFloat(target.replace(",", "."));
    if (!price || price <= 0) return;
    await fetch("/api/price-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, targetPrice: price }),
    });
    setSaved(true);
    setOpen(false);
  };

  if (saved) {
    return (
      <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
        ✓ Alerta activa
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          if (suggested) setTarget(String(suggested));
          setOpen(true);
        }}
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
      >
        🔔 Alerta de precio
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder={suggested ? `Ej. ${suggested}` : "Precio €"}
        className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={save}
        className="rounded-lg bg-amber-500/30 px-3 py-2 text-xs font-bold text-amber-200"
      >
        Guardar
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500">
        Cancelar
      </button>
    </div>
  );
}

export function ProductActions({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <FavoriteButton productId={productId} />
      <PriceAlertButton productId={productId} currentPrice={currentPrice} />
    </div>
  );
}
