"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProductById } from "@/lib/products";

export function PersonalizedFeed({ title = "Para ti" }: { title?: string }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [personalized, setPersonalized] = useState(false);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((d) => {
        setProductIds(d.products ?? []);
        setPersonalized(!!d.personalized);
      })
      .catch(() => {});
  }, []);

  const products = productIds.map((id) => getProductById(id)).filter(Boolean);
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {personalized ? "✨ Recomendado para ti" : "🔥 Mejores chollos hoy"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {personalized
              ? "Basado en tus visitas, búsquedas y favoritos"
              : "Algoritmo de scoring por descuento, valoraciones y ahorro"}
          </p>
        </div>
        {!personalized && (
          <Link href="/login" className="text-sm text-indigo-400 hover:underline">
            Inicia sesión para personalizar →
          </Link>
        )}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => p && <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
