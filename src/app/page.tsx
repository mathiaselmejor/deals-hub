import Link from "next/link";
import { DealOfDayBanner } from "@/components/DealOfDayBanner";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { StoreMarquee } from "@/components/StoreMarquee";
import { TopListsSection, TrustBar } from "@/components/TopListsSection";
import {
  formatPrice,
  getCatalog,
  getFeaturedProducts,
  getProductsByCategory,
  getTrendingProducts,
} from "@/lib/products";

export default function HomePage() {
  const catalog = getCatalog();
  const trending = getTrendingProducts();
  const featured = getFeaturedProducts();
  const ropa = getProductsByCategory("ropa");

  return (
    <>
      <JsonLd />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="glow-orb animate-pulse-glow -left-32 top-0 h-96 w-96 bg-indigo-600/30" />
        <div className="glow-orb animate-pulse-glow -right-32 top-20 h-80 w-80 bg-rose-600/20" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Actualizado {catalog.lastUpdated} · {catalog.products.length} ofertas activas
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Encuentra el{" "}
            <span className="gradient-text">mejor precio</span>
            <br />
            en todas las tiendas
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Comparamos Amazon, PcComponentes, MediaMarkt, El Corte Inglés, Fnac, eBay
            y más — para que no pagues de más nunca.
          </p>

          {/* Buscador principal */}
          <div className="mt-8 max-w-2xl">
            <SearchBar size="large" placeholder="¿Qué buscas? zapatillas, sudadera, nike, air fryer..." />
            <p className="mt-3 text-xs text-slate-500">
              Encuentra todas las ofertas de un producto al instante — sin revisar uno por uno
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="#ofertas"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 font-bold shadow-xl shadow-indigo-500/25 transition hover:opacity-90"
            >
              Explorar ofertas →
            </a>
            <Link
              href="/rankings"
              className="rounded-xl border border-white/15 px-8 py-3.5 font-semibold transition hover:bg-white/5"
            >
              Ver rankings 2026
            </Link>
          </div>
        </div>
      </section>

      <StoreMarquee />
      <DealOfDayBanner />
      <TrustBar />

      {/* Trending carousel */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">🔥 Trending ahora</h2>
          <a href="#ofertas" className="text-sm text-indigo-400 hover:underline">Ver todos</a>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {trending.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.id}`}
              className="group flex w-64 shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-card p-3 transition hover:border-indigo-500/40"
            >
              <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-indigo-300">{p.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-400">{formatPrice(p.price)}</span>
                  {p.discount > 0 && (
                    <span className="text-xs text-rose-400">-{p.discount}%</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="text-xl font-bold">⭐ Destacados</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        </section>
      )}

      <TopListsSection />

      {/* Ropa & Moda */}
      {ropa.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">👕 Ropa & Moda</h2>
              <p className="mt-1 text-sm text-slate-400">
                Zapatillas, sudaderas, vaqueros y chaquetas con los mejores precios
              </p>
            </div>
            <Link href="/buscar?q=ropa" className="text-sm text-indigo-400 hover:underline">
              Ver toda la ropa →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ropa.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        </section>
      )}

      {/* Main catalog */}
      <section id="ofertas" className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="text-2xl font-bold">Todas las ofertas</h2>
        <p className="mt-1 text-sm text-slate-400">
          Busca, filtra y compara precios en tiempo real
        </p>
        <div className="mt-8">
          <ProductGrid products={catalog.products} categories={catalog.categories} />
        </div>
      </section>

      <FAQ />
    </>
  );
}
