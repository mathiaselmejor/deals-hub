import { Suspense } from "react";
import { HowItWorksStrip } from "@/components/HowItWorksStrip";
import { SearchResults } from "@/components/SearchResults";
import { StoreTrustStrip } from "@/components/StoreTrustStrip";
import { Breadcrumbs } from "@/components/RelatedProducts";
import { getCatalog } from "@/lib/products";

export const metadata = {
  title: "Buscar ofertas",
  description: "Busca chollos y compara precios en Amazon, MediaMarkt, PcComponentes y más.",
};

export const dynamic = "force-dynamic";

export default function BuscarPage() {
  const catalog = getCatalog();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Buscar ofertas" }]} />

      <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-card p-8 mesh-bg">
        <h1 className="text-3xl font-bold sm:text-4xl">🔍 Buscar ofertas</h1>
        <p className="mt-2 max-w-xl text-slate-400">
          Encuentra al instante cualquier producto — por texto o{" "}
          <a href="/buscar/imagen" className="text-violet-300 hover:underline">
            subiendo una foto
          </a>{" "}
          — y compara precios en {catalog.products.length} artículos de tiendas afiliadas en España.
        </p>
      </section>

      <div className="mt-8">
        <Suspense fallback={<div className="skeleton-shimmer h-14 rounded-xl" />}>
          <SearchResults allProducts={catalog.products} />
        </Suspense>
      </div>

      <div className="mt-12">
        <StoreTrustStrip />
      </div>

      <HowItWorksStrip compact />
    </div>
  );
}
