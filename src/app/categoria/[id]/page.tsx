import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Breadcrumbs } from "@/components/RelatedProducts";
import { SearchBar } from "@/components/SearchBar";
import {
  getCatalog,
  getCategoryById,
  getProductsByCategory,
  sortProducts,
} from "@/lib/products";
import { rankProductsByDealScore } from "@/lib/algorithms";

export function generateStaticParams() {
  return getCatalog()
    .categories.filter((c) => c.id !== "all")
    .map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cat = getCategoryById(id);
  if (!cat) return {};
  return {
    title: `Ofertas en ${cat.label}`,
    description:
      cat.description ?? `Las mejores ofertas en ${cat.label} comparadas en múltiples tiendas.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = getCategoryById(id);
  if (!cat || id === "all") notFound();

  const products = sortProducts(getProductsByCategory(id), "discount");
  const topPicks = rankProductsByDealScore(products).slice(0, 3);
  const topDiscount = products[0]?.discount ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/#categorias" },
          { label: cat.label },
        ]}
      />

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-card p-8 mesh-bg">
        <div className="flex flex-wrap items-start gap-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-4xl">
            {cat.icon}
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold sm:text-4xl">{cat.label}</h1>
            {cat.description && <p className="mt-2 max-w-2xl text-slate-400">{cat.description}</p>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-300">
                {products.length} ofertas
              </span>
              {topDiscount > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-400">
                  Hasta -{topDiscount}%
                </span>
              )}
              <Link
                href="/comparar"
                className="rounded-full border border-white/10 px-3 py-1 text-slate-400 hover:border-indigo-500/30 hover:text-indigo-300"
              >
                ⚔️ Comparar en esta categoría
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 max-w-xl">
        <SearchBar placeholder={`Buscar en ${cat.label.toLowerCase()}...`} />
      </div>

      {topPicks.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            eyebrow="Mejor Deal Score"
            title={`Top picks en ${cat.label}`}
            description="Los productos con mejor relación precio-calidad en esta categoría."
            accent="emerald"
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topPicks.map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <SectionHeader
          title={`Todos los productos — ${cat.label}`}
          description="Ordenados por mayor descuento. Compara precios en varias tiendas antes de comprar."
          accent="indigo"
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {products.length === 0 && (
        <p className="py-16 text-center text-slate-400">Pronto más ofertas en esta categoría.</p>
      )}

      <div className="mt-12 text-center">
        <Link href="/" className="text-sm text-indigo-400 hover:underline">
          ← Ver todas las categorías
        </Link>
      </div>
    </div>
  );
}
