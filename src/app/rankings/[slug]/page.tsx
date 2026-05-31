import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/RelatedProducts";
import { getCatalog, getProductById, getTopListBySlug, getTopLists } from "@/lib/products";

export function generateStaticParams() {
  return getTopLists().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const list = getTopListBySlug(slug);
  if (!list) return {};
  return {
    title: list.title,
    description: list.description,
  };
}

export default async function RankingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = getTopListBySlug(slug);
  if (!list) notFound();

  const products = list.productIds
    .map((id) => getProductById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getProductById>>[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Rankings", href: "/rankings" },
          { label: list.title },
        ]}
      />

      <h1 className="text-3xl font-bold">{list.title}</h1>
      <p className="mt-3 max-w-2xl text-slate-400">{list.description}</p>
      <p className="mt-2 text-xs text-slate-500">
        Actualizado {getCatalog().lastUpdated}
      </p>

      <div className="mt-10 space-y-8">
        {products.map((product, i) => (
          <div key={product.id} className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold shadow-lg">
              {i + 1}
            </div>
            <div className="flex-1">
              <ProductCard product={product} featured={i === 0} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/#ofertas"
          className="rounded-xl bg-indigo-500/20 px-6 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/30"
        >
          Ver todas las ofertas →
        </Link>
      </div>
    </div>
  );
}
