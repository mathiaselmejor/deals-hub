"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProductById, formatPrice, getLowestPrice } from "@/lib/products";

type Favorite = { product_id: string; created_at: string };
type Alert = { product_id: string; target_price: number; active: boolean };

export function AccountDashboard() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/favorites").then((r) => r.json()),
      fetch("/api/price-alerts").then((r) => r.json()),
    ])
      .then(([fav, al]) => {
        setFavorites(fav.favorites ?? []);
        setAlerts(al.alerts ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

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
    setAlerts((a) => a.filter((x) => x.product_id !== productId));
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando tu panel...</p>;
  }

  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="text-lg font-bold">♥ Favoritos ({favorites.length})</h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Aún no tienes favoritos.{" "}
            <Link href="/#ofertas" className="text-indigo-400 hover:underline">
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

      <section>
        <h2 className="text-lg font-bold">🔔 Alertas de precio ({alerts.length})</h2>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Crea alertas desde cualquier ficha de producto.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {alerts.map((a) => {
              const p = getProductById(a.product_id);
              if (!p) return null;
              const current = getLowestPrice(p) || p.price;
              const hit = current > 0 && current <= a.target_price;
              return (
                <li
                  key={a.product_id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-card p-4"
                >
                  <div>
                    <Link
                      href={`/producto/${a.product_id}`}
                      className="font-medium hover:text-indigo-300"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      Objetivo: {formatPrice(a.target_price)} · Actual:{" "}
                      {formatPrice(current)}
                      {hit && (
                        <span className="ml-2 font-semibold text-emerald-400">¡Precio alcanzado!</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAlert(a.product_id)}
                    className="text-xs text-slate-500 hover:text-rose-400"
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
