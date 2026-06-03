"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProductById, formatPrice } from "@/lib/products";

type Favorite = { product_id: string; created_at: string };
type AlertLive = {
  productId: string;
  productName: string;
  targetPrice: number;
  priceAtCreate: number | null;
  notifiedAt: string | null;
  currentPrice: number;
  hit: boolean;
  percentToTarget: number | null;
};

export function AccountDashboard() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [alerts, setAlerts] = useState<AlertLive[]>([]);
  const [loading, setLoading] = useState(true);
  const [hitCount, setHitCount] = useState(0);

  const refresh = useCallback(() => {
    return Promise.all([
      fetch("/api/favorites").then((r) => r.json()),
      fetch("/api/price-alerts/check").then((r) => r.json()),
    ]).then(([fav, check]) => {
      setFavorites(fav.favorites ?? []);
      setAlerts((check.alerts ?? []) as AlertLive[]);
      setHitCount(check.hitCount ?? 0);
    });
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    const t = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(t);
  }, [refresh]);

  const removeFavorite = async (productId: string) => {
    await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setFavorites((f) => f.filter((x) => x.product_id !== productId));
  };

  const removeAlert = async (productId: string) => {
    await fetch("/api/price-alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    await refresh();
  };

  const updateTarget = async (productId: string, targetPrice: number) => {
    await fetch("/api/price-alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, targetPrice }),
    });
    await refresh();
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando tu panel...</p>;
  }

  return (
    <div className="mt-10 space-y-10">
      {hitCount > 0 && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5">
          <p className="text-lg font-bold text-emerald-300">
            🎉 {hitCount} {hitCount === 1 ? "alerta activada" : "alertas activadas"} — precio alcanzado
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Compara y compra antes de que suba otra vez.
          </p>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">🔔 Alertas de precio ({alerts.length})</h2>
          <Link href="/buscar" className="text-sm text-indigo-400 hover:underline">
            + Buscar productos
          </Link>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Revisamos precios cada 2 horas. Te enviamos email si configuraste Resend en Vercel.
        </p>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Crea alertas desde cualquier ficha de producto con el botón 🔔.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {alerts.map((a) => {
              const progress = a.hit
                ? 100
                : a.percentToTarget != null
                  ? Math.max(8, Math.min(92, 100 - a.percentToTarget))
                  : 40;
              return (
                <li
                  key={a.productId}
                  className={`rounded-xl border p-4 ${
                    a.hit ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-card"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/producto/${a.productId}`}
                        className="font-medium hover:text-indigo-300"
                      >
                        {a.productName}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span className="text-amber-300">Objetivo: {formatPrice(a.targetPrice)}</span>
                        <span className="text-slate-400">Actual: {formatPrice(a.currentPrice)}</span>
                        {a.hit && (
                          <span className="font-semibold text-emerald-400">¡Comprar ahora!</span>
                        )}
                        {!a.hit && a.percentToTarget != null && a.percentToTarget > 0 && (
                          <span className="text-slate-500">
                            Falta ~{a.percentToTarget}% para tu precio
                          </span>
                        )}
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-all ${
                            a.hit ? "bg-emerald-500" : "bg-amber-500/70"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const v = prompt("Nuevo precio objetivo (€)", String(a.targetPrice));
                          if (v) {
                            const n = parseFloat(v.replace(",", "."));
                            if (n > 0) void updateTarget(a.productId, n);
                          }
                        }}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        Cambiar objetivo
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAlert(a.productId)}
                        className="text-xs text-slate-500 hover:text-rose-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold">♥ Favoritos ({favorites.length})</h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Aún no tienes favoritos.{" "}
            <Link href="/#chollos" className="text-indigo-400 hover:underline">
              Explorar ofertas
            </Link>
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {favorites.map((f) => {
              const p = getProductById(f.product_id);
              if (!p) return null;
              return (
                <div key={f.product_id} className="relative">
                  <ProductCard product={p} />
                  <button
                    type="button"
                    onClick={() => removeFavorite(f.product_id)}
                    className="absolute right-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-rose-300 backdrop-blur"
                  >
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
