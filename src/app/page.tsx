import Link from "next/link";
import { CategoryExplorer } from "@/components/CategoryExplorer";
import { CategoryRails } from "@/components/CategoryRails";
import { ConversionBanner } from "@/components/ConversionBanner";
import { DealOfDayBanner } from "@/components/DealOfDayBanner";
import { EditorsChoiceSection } from "@/components/EditorsChoiceSection";
import { FAQ } from "@/components/FAQ";
import { HowItWorksStrip } from "@/components/HowItWorksStrip";
import { JsonLd } from "@/components/JsonLd";
import { PopularComparisons } from "@/components/PopularComparisons";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { StoreTrustStrip } from "@/components/StoreTrustStrip";
import dynamic from "next/dynamic";

const ProductGrid = dynamic(
  () => import("@/components/ProductGrid").then((m) => m.ProductGrid),
  {
    loading: () => (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-80 rounded-2xl" />
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
  getAliExpressDeals,
} from "@/lib/products";
import {
  getAlgorithmicTrending,
  getBestDealsToday,
  rankProductsByDealScore,
} from "@/lib/algorithms";
import { getRotationDayKey } from "@/lib/catalog-pipeline";

export default function HomePage() {
  const catalog = getCatalog();
  const deals = rankProductsByDealScore(getDealProducts());
  const trending = getAlgorithmicTrending(12);
  const featured = getFeaturedProducts();
  const bestDeals = getBestDealsToday(4);
  const editorsPicks = rankProductsByDealScore(catalog.products).slice(0, 3);
  const ropa = getProductsByCategory("ropa");
  const aliexpressDeals = getAliExpressDeals(8);
  const fullCatalog = [...catalog.products].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const directCatalogCount = catalog.products.filter((p) =>
    p.offers.some((o) => o.store === "amazon" && o.linkKind === "direct"),
  ).length;
  const rotationDay = getRotationDayKey() ?? catalog.lastUpdated;

  return (
    <>
      <JsonLd />

      {/* Hero — inspiración Kelkoo + Wirecutter */}
      <section className="relative overflow-hidden mesh-bg">
        <div className="glow-orb animate-pulse-glow -left-32 top-0 h-96 w-96 bg-indigo-600/30" />
        <div className="glow-orb animate-pulse-glow -right-32 top-20 h-80 w-80 bg-rose-600/20" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Comparador activo · {catalog.products.length} productos
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Encuentra el{" "}
                <span className="gradient-text">mejor precio</span>
                <br />
                en segundos
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
                Idealo, Kelkoo y Versus en uno: comparamos{" "}
                <strong className="text-white">Amazon, MediaMarkt, Fnac, PcComponentes</strong> y más.
                Deal Score, duelos de productos y enlaces directos verificados.
              </p>

              <div className="mt-8">
                <SearchBar size="large" placeholder="¿Qué quieres comprar hoy?" />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/#chollos" className="btn-primary px-8 py-3.5 text-sm">
                  Ver chollos ({deals.length}) →
                </Link>
                <Link href="/comparar" className="btn-secondary px-8 py-3.5 text-sm">
                  ⚔️ Comparar productos
                </Link>
                <Link href="/#catalogo" className="btn-secondary px-6 py-3.5 text-sm text-slate-400">
                  Catálogo
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="hero-stat col-span-2">
                <p className="text-xs text-slate-500">Enlaces directos verificados</p>
                <p className="text-3xl font-bold text-emerald-400">{directCatalogCount}</p>
              </div>
              <div className="hero-stat">
                <p className="text-xs text-slate-500">Tiendas</p>
                <p className="text-2xl font-bold text-indigo-300">8+</p>
              </div>
              <div className="hero-stat">
                <p className="text-xs text-slate-500">Rotación</p>
                <p className="text-lg font-bold text-amber-300">{rotationDay}</p>
              </div>
              {bestDeals[0] && (
                <Link
                  href={`/producto/${bestDeals[0].id}`}
                  className="hero-stat col-span-2 transition hover:border-emerald-500/30"
                >
                  <p className="text-xs text-emerald-400">⚡ Chollo del día</p>
                  <p className="mt-1 line-clamp-1 font-semibold">{bestDeals[0].name}</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {formatPrice(bestDeals[0].price)}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <StoreMarquee />
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <StoreTrustStrip />
      </div>

      <HowItWorksStrip />
      <DealOfDayBanner />
      <ConversionBanner />
      <TrustBar />
      <PersonalizedFeed />

      {/* Elección del editor — Wirecutter */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeader
          eyebrow="Recomendación editorial"
          title="🏆 Nuestra elección — mejor Deal Score"
          description="Los productos con mejor equilibrio entre precio, descuento y valoración ahora mismo."
          href="/rankings"
          linkLabel="Ver rankings →"
          accent="emerald"
        />
        <div className="mt-8">
          <EditorsChoiceSection products={editorsPicks} />
        </div>
      </section>

      {/* Comparaciones populares — Versus + Idealo */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeader
          eyebrow="Duelos populares"
          title="⚔️ Comparaciones que más buscan"
          description="Elige dos productos y mira precios, specs y Deal Score lado a lado — estilo Versus, con tiendas reales."
          href="/comparar"
          accent="indigo"
        />
        <div className="mt-8">
          <PopularComparisons />
        </div>
      </section>

      {/* Chollos */}
      <section
        id="chollos"
        className="scroll-mt-24 border-y border-white/5 bg-gradient-to-b from-rose-500/[0.04] to-transparent"
      >
        <div className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeader
            eyebrow="Zona ofertas"
            title="🔥 Chollos y ofertas destacadas"
            description="Descuentos reales y productos trending — lo que más conviene comprar ahora."
            href="/#catalogo"
            accent="rose"
          />

          <div className="mt-10 flex items-center justify-between">
            <h3 className="text-lg font-bold">Trending ahora</h3>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {trending.map((p) => (
              <Link
                key={p.id}
                href={`/producto/${p.id}`}
                className="group flex w-72 shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-card p-3 transition hover:border-indigo-500/40"
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
            <div className="mt-12">
              <h3 className="text-lg font-bold">💰 Top chollos del día</h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {bestDeals.map((p) => (
                  <ProductCard key={p.id} product={p} featured />
                ))}
              </div>
            </div>
          )}

          {featured.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-bold">⭐ Destacados</h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} featured />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <h3 className="text-lg font-bold">Todas las ofertas con descuento</h3>
            <p className="mt-1 text-sm text-slate-500">{deals.length} productos en promoción</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {deals.slice(0, 12).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="categorias">
        <CategoryExplorer />
      </div>

      <TopListsSection />
      <CategoryRails />

      {aliexpressDeals.length > 0 && (
        <section id="aliexpress" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12">
          <SectionHeader
            eyebrow="AliExpress afiliado"
            title="🛒 Ofertas AliExpress"
            description="Precios directos de fábrica con enlaces verificados."
            accent="rose"
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aliexpressDeals.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        </section>
      )}

      {ropa.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionHeader
            title="👕 Ropa & Moda"
            description="Comparativa en tiendas afiliadas"
            href="/categoria/ropa"
            accent="indigo"
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ropa.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        </section>
      )}

      <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20">
        <SectionHeader
          eyebrow="Tiendas afiliadas"
          title="📦 Catálogo completo"
          description="Todos los productos en Amazon, PcComponentes, MediaMarkt, El Corte Inglés, Fnac, Decathlon, IKEA y eBay."
          accent="indigo"
        />
        <div className="mt-8">
          <ProductGrid products={fullCatalog} categories={catalog.categories} />
        </div>
      </section>

      <FAQ />
    </>
  );
}
