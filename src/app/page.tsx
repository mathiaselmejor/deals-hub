import Link from "next/link";
import { CategoryExplorer } from "@/components/CategoryExplorer";
import { CategoryRails } from "@/components/CategoryRails";
import { ConversionBanner } from "@/components/ConversionBanner";
import { DealOfDayBanner } from "@/components/DealOfDayBanner";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import dynamic from "next/dynamic";

const ProductGrid = dynamic(
  () => import("@/components/ProductGrid").then((m) => m.ProductGrid),
  {
    loading: () => (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    ),
  },
);
import { SearchBar } from "@/components/SearchBar";
import { StoreMarquee } from "@/components/StoreMarquee";
import { TopListsSection, TrustBar } from "@/components/TopListsSection";
import { PersonalizedFeed } from "@/components/PersonalizedFeed";
import {
  formatPrice,
  getCatalog,
  getDealProducts,
  getFeaturedProducts,
  getProductsByCategory,
} from "@/lib/products";
import { getAlgorithmicTrending, getBestDealsToday, rankProductsByDealScore } from "@/lib/algorithms";
import { getRotationDayKey } from "@/lib/catalog-pipeline";
export default function HomePage() {
  const catalog = getCatalog();
  const deals = rankProductsByDealScore(getDealProducts());
  const trending = getAlgorithmicTrending(12);
  const featured = getFeaturedProducts();
  const bestDeals = getBestDealsToday(4);
  const ropa = getProductsByCategory("ropa");
  const fullCatalog = [...catalog.products].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const directCatalogCount = catalog.products.filter((p) =>
    p.offers.some((o) => o.store === "amazon" && o.linkKind === "direct"),
  ).length;
  const rotationDay = getRotationDayKey() ?? catalog.lastUpdated;

  return (
    <>
      <JsonLd />

      {/* Marketing hero */}
      <section className="relative overflow-hidden">
        <div className="glow-orb animate-pulse-glow -left-32 top-0 h-96 w-96 bg-indigo-600/30" />
        <div className="glow-orb animate-pulse-glow -right-32 top-20 h-80 w-80 bg-rose-600/20" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Comparador activo · {catalog.products.length} productos en {catalog.categories.length - 1}{" "}
            categorías
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Compara y compra en{" "}
            <span className="gradient-text">Amazon, MediaMarkt, Fnac</span>
            <br />y más — al mejor precio
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Primero los <strong className="text-white">chollos del momento</strong>, después el{" "}
            <strong className="text-white">catálogo completo</strong> de tiendas que monetizamos.
            Producto nuevo siempre primero; también opciones reacondicionadas en cada ficha.
          </p>

          <div className="mt-8 max-w-2xl">
            <SearchBar size="large" placeholder="Buscar en todo el catálogo..." />
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/#chollos"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 font-bold shadow-xl shadow-indigo-500/25 transition hover:opacity-90"
            >
              Ver chollos ({deals.length}) →
            </Link>
            <Link
              href="/#catalogo"
              className="rounded-xl border border-white/15 px-8 py-3.5 font-semibold transition hover:bg-white/5"
            >
              Catálogo completo ({catalog.products.length})
            </Link>
          </div>
        </div>
      </section>

      <StoreMarquee />
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Calidad verificada
          </p>
          <h2 className="mt-1 text-2xl font-bold">Comparador premium, sin humo</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-2xl font-bold text-emerald-300">{directCatalogCount}</p>
              <p className="text-xs text-slate-400">Productos con enlace directo verificado</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-2xl font-bold text-indigo-300">{catalog.products.length}</p>
              <p className="text-xs text-slate-400">Productos activos en catálogo</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-2xl font-bold text-amber-300">{rotationDay}</p>
              <p className="text-xs text-slate-400">Rotación diaria de destacados</p>
            </div>
          </div>
        </div>
      </section>
      <DealOfDayBanner />
      <ConversionBanner />
      <TrustBar />
      <PersonalizedFeed />

      {/* ——— MARKETING: chollos y destacados ——— */}
      <section id="chollos" className="scroll-mt-24 border-b border-white/5 bg-gradient-to-b from-rose-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-300">Zona marketing</p>
            <h2 className="mt-1 text-2xl font-bold">🔥 Chollos y ofertas destacadas</h2>
            <p className="mt-2 text-sm text-slate-400">
              Descuentos reales y productos trending — lo que más conviene comprar ahora.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h3 className="text-xl font-bold">Trending ahora</h3>
            <a href="#catalogo" className="text-sm text-indigo-400 hover:underline">
              Ir al catálogo completo
            </a>
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

          {bestDeals.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold">💰 Top chollos del día</h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {bestDeals.map((p) => (
                  <ProductCard key={p.id} product={p} featured />
                ))}
              </div>
            </div>
          )}

          {featured.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold">⭐ Destacados patrocinados</h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} featured />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <h3 className="text-xl font-bold">Todas las ofertas con descuento</h3>
            <p className="mt-1 text-sm text-slate-500">{deals.length} productos en promoción</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {deals.slice(0, 12).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {deals.length > 12 && (
              <p className="mt-6 text-center text-sm text-slate-500">
                +{deals.length - 12} chollos más en el catálogo completo abajo
              </p>
            )}
          </div>
        </div>
      </section>

      <div id="categorias">
        <CategoryExplorer />
      </div>

      <TopListsSection />
      <CategoryRails />

      {ropa.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">👕 Ropa & Moda</h2>
              <p className="mt-1 text-sm text-slate-400">Comparativa en tiendas afiliadas</p>
            </div>
            <Link href="/categoria/ropa" className="text-sm text-indigo-400 hover:underline">
              Ver categoría →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ropa.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        </section>
      )}

      {/* ——— CATÁLOGO COMPLETO (monetización) ——— */}
      <section id="catalogo" className="scroll-mt-24 mx-auto max-w-7xl px-4 pb-20">
        <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/5 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Tiendas afiliadas
          </p>
          <h2 className="mt-1 text-2xl font-bold">📦 Catálogo completo para comprar</h2>
          <p className="mt-2 text-sm text-slate-400">
            Todos los productos — con y sin descuento — en Amazon, PcComponentes, MediaMarkt, El Corte
            Inglés, Fnac, Decathlon, IKEA y eBay. En cada producto: precio nuevo primero y opción
            reacondicionada.
          </p>
        </div>
        <div className="mt-8">
          <ProductGrid products={fullCatalog} categories={catalog.categories} />
        </div>
      </section>

      <FAQ />
    </>
  );
}
