"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { ImageSearchPanel } from "@/components/ImageSearchPanel";
import { trackSearch } from "@/components/InteractionTracker";
import { SearchFilters } from "@/components/SearchFilters";
import { sortProducts } from "@/lib/products";
import { getPopularSearches } from "@/lib/search-constants";
import { searchProductsRanked, rankProductsByDealScore } from "@/lib/algorithms";
import { loadImageSearchSession } from "@/lib/image-search-client";
import { isDirectPurchaseOffer } from "@/lib/offer-target";
import type { Product, SortOption, StoreId } from "@/lib/types";

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
  const src = searchParams.get("src");
  const isImageSearch = src === "image";
  const [sort, setSort] = useState<SortOption>("discount");
  const [imageSession, setImageSession] = useState(loadImageSearchSession);
  const [storeFilter, setStoreFilter] = useState<StoreId[]>([]);
  const [minDiscount, setMinDiscount] = useState(0);
  const [directOnly, setDirectOnly] = useState(false);

  useEffect(() => {
    if (isImageSearch) setImageSession(loadImageSearchSession());
  }, [isImageSearch, q]);

  const baseResults = useMemo(() => {
    if (isImageSearch && imageSession?.productIds.length) {
      const byId = new Map(allProducts.map((p) => [p.id, p]));
      const ranked = imageSession.productIds
        .map((id) => byId.get(id))
        .filter(Boolean) as Product[];
      if (ranked.length > 0) {
        return sort === "discount" ? ranked : sortProducts(ranked, sort);
      }
    }

    const found = q.trim() ? searchProductsRanked(q) : rankProductsByDealScore(allProducts);
    return sort === "discount" && q.trim() ? found : sortProducts(found, sort);
  }, [q, sort, allProducts, isImageSearch, imageSession]);

  const availableStores = useMemo(() => {
    const set = new Set<StoreId>();
    for (const p of baseResults) {
      for (const o of p.offers) set.add(o.store);
    }
    return [...set].sort();
  }, [baseResults]);

  const results = useMemo(() => {
    return baseResults.filter((p) => {
      if (minDiscount > 0 && p.discount < minDiscount) return false;
      if (storeFilter.length > 0 && !p.offers.some((o) => storeFilter.includes(o.store))) {
        return false;
      }
      if (directOnly && !p.offers.some((o) => isDirectPurchaseOffer(o))) return false;
      return true;
    });
  }, [baseResults, minDiscount, storeFilter, directOnly]);

  useEffect(() => {
    if (q.trim() && !isImageSearch) trackSearch(q.trim());
  }, [q, isImageSearch]);

  const popular = getPopularSearches();
  const analysis = isImageSearch ? imageSession?.analysis : null;

  return (
    <div>
      <SearchBar defaultValue={q} size="large" autoFocus={!q} />

      {isImageSearch && analysis && (
        <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
          <p className="text-sm font-semibold text-violet-200">Resultados por imagen</p>
          <p className="mt-1 text-white">{analysis.descriptionEs}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.brand && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                Marca: {analysis.brand}
              </span>
            )}
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
              Tipo: {analysis.productType}
            </span>
            {analysis.keywords.slice(0, 4).map((kw) => (
              <span key={kw} className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs text-indigo-200">
                {kw}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            También puedes refinar buscando por texto arriba.
          </p>
        </div>
      )}

      {q.trim() ? (
        <>
          <SearchFilters
            availableStores={availableStores}
            selectedStores={storeFilter}
            onStoresChange={setStoreFilter}
            minDiscount={minDiscount}
            onMinDiscountChange={setMinDiscount}
            directOnly={directOnly}
            onDirectOnlyChange={setDirectOnly}
          />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg">
              <span className="font-bold text-white">{results.length}</span>{" "}
              <span className="text-slate-400">
                {results.length === 1 ? "resultado" : "resultados"} para{" "}
                <span className="text-indigo-400">&ldquo;{q}&rdquo;</span>
                {isImageSearch && <span className="text-violet-300"> (búsqueda visual)</span>}
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

          {results.length === 0 && baseResults.length > 0 ? (
            <div className="mt-12 text-center">
              <p className="text-lg font-semibold text-slate-300">Ningún resultado con estos filtros</p>
              <p className="mt-2 text-sm text-slate-500">
                Prueba quitar tiendas o bajar el descuento mínimo ({baseResults.length} sin filtrar).
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <p className="text-5xl">😕</p>
              <p className="mt-4 text-xl font-semibold">No encontramos ofertas para &ldquo;{q}&rdquo;</p>
              <p className="mt-2 text-slate-400">
                Prueba con otra palabra, sube otra foto o mira las búsquedas populares
              </p>
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
        <div className="mt-10 space-y-10">
          <ImageSearchPanel />

          <div>
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
              Escribe lo que buscas — zapatillas, ropa, electrónica, gaming — o sube una foto si no
              recuerdas el nombre del producto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
