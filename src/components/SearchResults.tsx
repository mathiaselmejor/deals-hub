"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { trackSearch } from "@/components/InteractionTracker";
import { sortProducts } from "@/lib/products";
import { getPopularSearches } from "@/lib/search-constants";
import { searchProductsRanked, rankProductsByDealScore } from "@/lib/algorithms";
import type { Product, SortOption } from "@/lib/types";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "discount", label: "Mayor descuento" },
  { value: "price-asc", label: "Precio ↑" },
  { value: "price-desc", label: "Precio ↓" },
  { value: "rating", label: "Mejor valorados" },
  { value: "reviews", label: "Más opiniones" },
];

export function SearchResults({ allProducts }: { allProducts: Product[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [sort, setSort] = useState<SortOption>("discount");

  const results = useMemo(() => {
    const found = q.trim() ? searchProductsRanked(q) : rankProductsByDealScore(allProducts);
    return sort === "discount" && q.trim() ? found : sortProducts(found, sort);
  }, [q, sort, allProducts]);

  useEffect(() => {
    if (q.trim()) trackSearch(q.trim());
  }, [q]);

  const popular = getPopularSearches();

  return (
    <div>
      <SearchBar defaultValue={q} size="large" autoFocus={!q} />

      {q.trim() ? (
        <>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg">
              <span className="font-bold text-white">{results.length}</span>{" "}
              <span className="text-slate-400">
                {results.length === 1 ? "resultado" : "resultados"} para{" "}
                <span className="text-indigo-400">&ldquo;{q}&rdquo;</span>
              </span>
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-xl border border-white/10 bg-card px-4 py-2.5 text-sm text-white focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-card">
                  Ordenar: {o.label}
                </option>
              ))}
            </select>
          </div>

          {results.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <p className="text-5xl">😕</p>
              <p className="mt-4 text-xl font-semibold">No encontramos ofertas para &ldquo;{q}&rdquo;</p>
              <p className="mt-2 text-slate-400">Prueba con otra palabra o mira las búsquedas populares</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {popular.map((term) => (
                  <a
                    key={term}
                    href={`/buscar?q=${encodeURIComponent(term)}`}
                    className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-indigo-500/20 hover:text-indigo-300"
                  >
                    {term}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-300">Búsquedas populares</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {popular.map((term) => (
              <a
                key={term}
                href={`/buscar?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-white/10 bg-card px-4 py-2.5 text-sm transition hover:border-indigo-500/40 hover:text-indigo-300"
              >
                🔥 {term}
              </a>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-500">
            Escribe lo que buscas — zapatillas, ropa, electrónica, gaming — y te mostramos
            todas las ofertas de golpe, sin revisar producto por producto.
          </p>
        </div>
      )}
    </div>
  );
}
