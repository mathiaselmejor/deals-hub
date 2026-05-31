import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs, RelatedProducts } from "@/components/RelatedProducts";
import { JsonLd } from "@/components/JsonLd";
import { AffiliateLink } from "@/components/AffiliateLink";
import {
  buildAffiliateUrl,
  formatPrice,
  formatReviews,
  getAffiliateConfig,
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
  return {
    title: `${product.name} — Mejor precio en España`,
    description: `${product.description} Compara precios en ${product.offers.length} tiendas. Desde ${formatPrice(product.price)}.`,
    keywords: product.keywords,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const config = getAffiliateConfig();
  const related = getRelatedProducts(product);
  const savings = getSavings(product);
  const sortedOffers = [...product.offers].sort((a, b) => {
    if (a.price === 0) return 1;
    if (b.price === 0) return -1;
    return a.price - b.price;
  });

  return (
    <>
      <JsonLd product={product} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: getCategoryLabel(product.category), href: "/#ofertas" },
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
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

            {/* Store comparison */}
            <div className="mt-8">
              <h2 className="text-lg font-bold">Comparar tiendas ({sortedOffers.length})</h2>
              <div className="mt-4 space-y-3">
                {sortedOffers.map((offer, i) => {
                  const store = config.stores[offer.store];
                  const priceDiff = offer.price > 0 && product.price > 0
                    ? offer.price - product.price
                    : 0;
                  return (
                    <AffiliateLink
                      key={offer.store}
                      href={buildAffiliateUrl(offer)}
                      productId={product.id}
                      store={offer.store}
                      className={`group flex items-center justify-between rounded-xl border p-4 transition hover:border-indigo-500/50 ${
                        i === 0 && offer.price > 0
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-white/10 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold"
                          style={{ backgroundColor: `${store.color}20`, color: store.color }}
                        >
                          {store.label.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <span className="font-semibold" style={{ color: store.color }}>
                            {store.label}
                          </span>
                          {offer.note && (
                            <p className="text-xs text-slate-500">{offer.note}</p>
                          )}
                          {i === 0 && offer.price > 0 && (
                            <p className="text-xs font-medium text-emerald-400">✓ Mejor precio</p>
                          )}
                          {priceDiff > 0 && i > 0 && (
                            <p className="text-xs text-rose-400/80">+{formatPrice(priceDiff)} vs mejor</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">
                          {offer.price > 0 ? formatPrice(offer.price) : "Reservar"}
                        </span>
                        <span className="rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-300 transition group-hover:bg-indigo-500 group-hover:text-white">
                          Ir →
                        </span>
                      </div>
                    </AffiliateLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts products={related} />
      </div>
    </>
  );
}
