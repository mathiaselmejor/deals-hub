import type { Metadata } from "next";
import Link from "next/link";
import { ProductCompareDuel } from "@/components/ProductCompareDuel";
import { ProductComparePicker } from "@/components/ProductComparePicker";
import { Breadcrumbs } from "@/components/RelatedProducts";
import {
  buildProductComparison,
  getCompareCatalogOptions,
  getComparePair,
} from "@/lib/compare";

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
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Comparar" },
        ]}
      />

      <div className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          Inspirado en Versus
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">⚔️ Comparar productos</h1>
        <p className="mt-3 text-slate-400">
          Como en{" "}
          <a
            href="https://versus.com/es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Versus.com
          </a>
          , pero con lo que ellos no tienen:{" "}
          <strong className="font-medium text-slate-300">
            precios reales, descuentos y enlaces de compra
          </strong>{" "}
          en tiendas afiliadas de España.
        </p>
      </div>

      <div className="mt-8">
        <ProductComparePicker options={options} initialA={a} initialB={b} />
      </div>

      {result ? (
        <div className="mt-10">
          <ProductCompareDuel result={result} />
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
          <p className="text-lg font-semibold">Elige dos productos para el duelo</p>
          <p className="mt-2 text-sm text-slate-500">
            O prueba un ejemplo rápido:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ExampleLink a="ninja-airfryer" b="cosori-airfryer" label="Freidoras" />
            <ExampleLink a="apple-airpods-pro-2-usb-c" b="sony-wh1000xm5" label="Auriculares" />
            <ExampleLink a="samsung-galaxy-s24-ultra" b="iphone-15-128gb" label="Móviles" />
          </div>
        </div>
      )}

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Deal Score",
            body: "Puntuación 0–100 con descuento, valoración y señales editoriales.",
          },
          {
            title: "Precio multi-tienda",
            body: "Mejor precio entre Amazon, MediaMarkt, PcComponentes y más.",
          },
          {
            title: "Specs lado a lado",
            body: "Barras visuales por criterio, al estilo Versus.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function ExampleLink({ a, b, label }: { a: string; b: string; label: string }) {
  return (
    <Link
      href={`/comparar?a=${a}&b=${b}`}
      className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-indigo-500/40 hover:bg-indigo-500/10"
    >
      {label}
    </Link>
  );
}
