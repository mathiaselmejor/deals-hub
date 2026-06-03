import { AffiliateLink } from "@/components/AffiliateLink";
import { OfferLinkBadge } from "@/components/ProductTransparency";
import {
  buildAffiliateUrl,
  formatPrice,
  getAffiliateConfig,
  getDisplayPrice,
  getNewOffers,
  isOrientativePrice,
} from "@/lib/products";
import type { Product } from "@/lib/types";

/** Tabla compacta estilo Idealo/Kelkoo — precios por tienda de un vistazo */
export function PriceCompareTable({ product }: { product: Product }) {
  const config = getAffiliateConfig();
  const offers = getNewOffers(product)
    .filter((o) => o.price > 0)
    .sort((a, b) => a.price - b.price);

  if (offers.length === 0) return null;

  const bestPrice = getDisplayPrice(product);
  const orientative = isOrientativePrice(product);
  const maxPrice = Math.max(...offers.map((o) => o.price));

  return (
    <div className="price-compare-table overflow-hidden rounded-2xl border border-white/10 bg-card">
      <div className="border-b border-white/5 bg-indigo-500/5 px-5 py-4">
        <h2 className="font-bold">Comparativa de precios</h2>
        <p className="mt-1 text-sm text-slate-400">
          {offers.length} tiendas
          {!orientative && maxPrice > bestPrice && (
            <>
              {" "}
              · ahorro hasta{" "}
              <span className="font-semibold text-emerald-400">
                {formatPrice(maxPrice - bestPrice)}
              </span>{" "}
              vs la más cara
            </>
          )}
          {orientative && (
            <span className="text-amber-200/80"> · precios orientativos — confirma en tienda</span>
          )}
        </p>
      </div>

      <div className="divide-y divide-white/5">
        {offers.map((offer, i) => {
          const store = config.stores[offer.store];
          const isBest = i === 0;
          const diff = offer.price - bestPrice;
          const barPct = maxPrice > bestPrice ? ((maxPrice - offer.price) / (maxPrice - bestPrice)) * 100 : 100;

          return (
            <AffiliateLink
              key={`${offer.store}-${i}`}
              href={buildAffiliateUrl(offer, product.id)}
              productId={product.id}
              store={offer.store}
              className={`group flex flex-col gap-2 px-5 py-4 transition sm:flex-row sm:items-center sm:justify-between ${
                isBest ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                  style={{ backgroundColor: `${store.color}20`, color: store.color }}
                >
                  {store.label.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold" style={{ color: store.color }}>
                      {store.label}
                    </span>
                    {isBest && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        MEJOR PRECIO
                      </span>
                    )}
                    <OfferLinkBadge offer={offer} />
                  </div>
                  <div className="mt-1.5 hidden h-1 max-w-xs overflow-hidden rounded-full bg-white/5 sm:block">
                    <div
                      className={`h-full rounded-full ${isBest ? "bg-emerald-500" : "bg-slate-600"}`}
                      style={{ width: `${Math.max(8, barPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:shrink-0">
                <div className="text-right">
                  <p className={`text-lg font-bold ${isBest ? "text-emerald-400" : "text-white"}`}>
                    {formatPrice(offer.price)}
                  </p>
                  {!isBest && diff > 0 && (
                    <p className="text-[10px] text-rose-400/80">+{formatPrice(diff)}</p>
                  )}
                </div>
                <span className="btn-primary px-4 py-2 text-xs opacity-90 group-hover:opacity-100">
                  Ir →
                </span>
              </div>
            </AffiliateLink>
          );
        })}
      </div>
    </div>
  );
}
