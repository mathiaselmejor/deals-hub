"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { searchProducts, sortProducts } from "@/lib/products";
import type { Category, Product, SortOption } from "@/lib/types";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "discount", label: "Mayor descuento" },
  { value: "price-asc", label: "Precio ↑" },
  { value: "price-desc", label: "Precio ↓" },
  { value: "rating", label: "Mejor valorados" },
  { value: "reviews", label: "Más opiniones" },
];

export function ProductGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("discount");

  const filtered = useMemo(() => {
    let result = active === "all" ? products : products.filter((p) => p.category === active);
    if (query.trim()) result = searchProducts(query).filter((p) => result.some((r) => r.id === p.id));
    return sortProducts(result, sort);
  }, [active, query, sort, products]);

  return (
    <>
      {/* Search + Sort bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            type="search"
            placeholder="Buscar productos, marcas, categorías..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-card py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-card">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              active === cat.id
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
        {query && ` para "${query}"`}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 text-lg font-medium text-slate-300">Sin resultados</p>
          <p className="mt-2 text-sm text-slate-500">Prueba con otra búsqueda o categoría</p>
          <button
            onClick={() => { setQuery(""); setActive("all"); }}
            className="mt-4 rounded-xl bg-indigo-500/20 px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-500/30"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
