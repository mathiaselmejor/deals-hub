import type { Metadata } from "next";
import Link from "next/link";
import { ProductCompareDuel } from "@/components/ProductCompareDuel";
import { ProductComparePicker } from "@/components/ProductComparePicker";
import { PopularComparisons } from "@/components/PopularComparisons";
import { SectionHeader } from "@/components/SectionHeader";
import { Breadcrumbs } from "@/components/RelatedProducts";
import {
  buildProductComparison,
  getCompareCatalogOptions,
  getComparePair,
} from "@/lib/compare";
import { POPULAR_COMPARISONS } from "@/lib/popular-comparisons";

export const metadata: Metadata = {
  title: "Comparar productos — Duelo de ofertas",
  description:
    "Comparador estilo Versus con precios reales en Amazon, MediaMarkt, PcComponentes y más. Especificaciones, Deal Score y mejor precio lado a lado.",
  openGraph: {
    title: "Comparar productos | DealsHub",
    description: "Duelo de productos con precios en tiendas españolas y Deal Score.",
  },
};

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const options = getCompareCatalogOptions();
  const { productA, productB } = getComparePair(a, b);
  const result =
    productA && productB && productA.id !== productB.id
      ? buildProductComparison(productA, productB)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Comparar" }]} />

      <section className="relative mt-6 overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-rose-500/5 p-8 mesh-bg">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Versus + Idealo en uno
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">⚔️ Comparar productos</h1>
          <p className="mt-3 text-slate-400">
            Specs, Deal Score y{" "}
            <strong className="font-medium text-slate-300">precios reales en tiendas españolas</strong>.
            Lo que Versus no tiene: enlaces de compra y descuentos verificados.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <ProductComparePicker options={options} initialA={a} initialB={b} />
      </div>

      {result ? (
        <div className="mt-10">
          <ProductCompareDuel result={result} />
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
            <p className="text-lg font-semibold">Elige dos productos arriba para iniciar el duelo</p>
            <p className="mt-2 text-sm text-slate-500">O prueba un ejemplo rápido:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {POPULAR_COMPARISONS.slice(0, 3).map((pair) => (
                <Link
                  key={`${pair.a}-${pair.b}`}
                  href={`/comparar?a=${pair.a}&b=${pair.b}`}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:border-indigo-500/40 hover:bg-indigo-500/10"
                >
                  {pair.label}
                </Link>
              ))}
            </div>
          </div>

          <SectionHeader
            eyebrow="Inspiración Versus"
            title="Duelos populares"
            description="Comparaciones frecuentes en nuestro catálogo."
            accent="indigo"
          />
          <PopularComparisons limit={6} />
        </div>
      )}

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: "📊",
            title: "Deal Score",
            body: "Puntuación 0–100 con descuento, valoración y señales editoriales.",
          },
          {
            icon: "🏪",
            title: "Precio multi-tienda",
            body: "Mejor precio entre Amazon, MediaMarkt, PcComponentes y más.",
          },
          {
            icon: "📐",
            title: "Specs lado a lado",
            body: "Barras visuales por criterio, al estilo Versus.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-white/10 bg-card p-5">
            <span className="text-2xl">{item.icon}</span>
            <h2 className="mt-2 font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
