import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs, RelatedProducts } from "@/components/RelatedProducts";
import { JsonLd } from "@/components/JsonLd";
import { ProductActions } from "@/components/ProductActions";
import { DealScoreBadgeForProduct } from "@/components/DealScoreBadge";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { ProductDetailExtras } from "@/components/ProductDetailExtras";
import { ProductTransparency } from "@/components/ProductTransparency";
import { StoreOffersPanel } from "@/components/StoreOffersPanel";
import { InteractionTracker } from "@/components/InteractionTracker";
import { computeDealScore } from "@/lib/algorithms";
import {
  formatPrice,
  formatReviews,
  getCatalog,
  getCategoryLabel,
  getProductById,
  getRelatedProducts,
  getSavings,
} from "@/lib/products";

export function generateStaticParams() {
  return getCatalog().products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return {};
  const title = `${product.name} — Mejor precio en España`;
  const description = `${product.description} Compara precios en ${product.offers.length} tiendas. Desde ${formatPrice(product.price)}.`;
  return {
    title,
    description,
    keywords: product.keywords,
    openGraph: {
      title,
      description,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const savings = getSavings(product);
  return (
    <>
      <JsonLd product={product} />
      <InteractionTracker productId={product.id} />
      <StickyBuyBar product={product} />
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 lg:pb-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: getCategoryLabel(product.category), href: `/categoria/${product.category}` },
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {product.discount > 0 && (
                <span className="absolute left-4 top-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-bold shadow-lg">
                  -{product.discount}% OFF
                </span>
              )}
            </div>

            {/* Specs */}
            {product.specs && (
              <div className="rounded-2xl border border-white/10 bg-card p-5">
                <h3 className="font-semibold">Especificaciones</h3>
                <dl className="mt-3 space-y-2">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <dt className="text-slate-500">{key}</dt>
                      <dd className="font-medium">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                {product.badge}
              </span>
              {product.trending && (
                <span className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300">
                  🔥 Trending
                </span>
              )}
              {product.dealOfDay && (
                <span className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                  ⚡ Oferta del día
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <DealScoreBadgeForProduct product={product} />
              {computeDealScore(product) >= 75 && (
                <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                  ⚡ Alta probabilidad de ahorro
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-amber-400">{"★".repeat(Math.round(product.rating))}</span>
                <span className="text-sm text-slate-400">{product.rating}/5</span>
              </div>
              <span className="text-sm text-slate-500">
                {formatReviews(product.reviews)} opiniones
              </span>
            </div>

            <p className="mt-6 leading-relaxed text-slate-300">
              {product.longDescription ?? product.description}
            </p>

            {/* Price */}
            {product.price > 0 && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl font-bold text-emerald-400">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xl text-slate-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="mt-2 text-sm text-rose-400">
                    🎉 Ahorras {formatPrice(savings)} ({product.discount}% de descuento)
                  </p>
                )}
              </div>
            )}

            <div className="mt-6">
              <ProductActions productId={product.id} currentPrice={product.price} />
            </div>

            {/* Pros & Cons */}
            {(product.pros || product.cons) && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {product.pros && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm font-semibold text-emerald-400">✓ Ventajas</p>
                    <ul className="mt-2 space-y-1">
                      {product.pros.map((p) => (
                        <li key={p} className="text-sm text-slate-400">• {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.cons && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                    <p className="text-sm font-semibold text-rose-400">✗ Desventajas</p>
                    <ul className="mt-2 space-y-1">
                      {product.cons.map((c) => (
                        <li key={c} className="text-sm text-slate-400">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <ProductTransparency product={product} />

            <StoreOffersPanel product={product} />
          </div>
        </div>

        <ProductDetailExtras product={product} />

        <RelatedProducts products={related} />
      </div>
    </>
  );
}
