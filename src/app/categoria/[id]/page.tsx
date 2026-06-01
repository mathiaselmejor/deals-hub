import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/RelatedProducts";
import { SearchBar } from "@/components/SearchBar";
import {
  getCatalog,
  getCategoryById,
  getProductsByCategory,
  sortProducts,
} from "@/lib/products";

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
    description: cat.description ?? `Las mejores ofertas en ${cat.label} comparadas en múltiples tiendas.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = getCategoryById(id);
  if (!cat || id === "all") notFound();

  const products = sortProducts(getProductsByCategory(id), "discount");
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

      <div className="flex items-start gap-4">
        <span className="text-5xl">{cat.icon}</span>
        <div>
          <h1 className="text-3xl font-bold">{cat.label}</h1>
          {cat.description && (
            <p className="mt-2 text-slate-400">{cat.description}</p>
          )}
          <p className="mt-2 text-sm text-indigo-400">{products.length} ofertas activas</p>
          {topDiscount > 0 && (
            <p className="mt-1 text-sm text-emerald-400">
              Hasta -{topDiscount}% de descuento en esta categoría
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4 text-sm text-slate-300">
        Comparamos precios en varias tiendas para {cat.label.toLowerCase()}. Elige un
        producto, revisa todas las ofertas y compra donde más te convenga — sin pagar de más.
      </div>

      <div className="mt-8 max-w-xl">
        <SearchBar placeholder={`Buscar en ${cat.label.toLowerCase()}...`} />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

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
