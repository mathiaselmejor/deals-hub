import { ProductImage } from "@/components/ProductImage";
import { getAmazonAsinFromOffers } from "@/lib/product-images";
import Link from "next/link";
import {
  buildAffiliateUrl,
  formatPrice,
  formatReviews,
  getAffiliateConfig,
  getBestOffer,
  getBestRefurbishedOffer,
  getLowestPrice,
  getNewOffers,
  getSavings,
} from "@/lib/catalog-formatters";
import { isOrientativePrice } from "@/lib/products";
import { computeDealScore } from "@/lib/algorithms";
import { isDirectPurchaseOffer } from "@/lib/offer-target";
import type { Product } from "@/lib/types";
import { AffiliateLink } from "@/components/AffiliateLink";
import { CompareToggleButton } from "@/components/CompareToggleButton";
import { DealScoreMini } from "@/components/DealScoreMini";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const config = getAffiliateConfig();
  const lowest = getLowestPrice(product);
  const best = getBestOffer(product);
  const bestRefurb = getBestRefurbishedOffer(product);
  const savings = getSavings(product);
  const orientative = isOrientativePrice(product);
  const showDiscount = product.discount > 0 && savings > 0 && !orientative;
  const storeCount = getNewOffers(product).length;
  const dealScore = computeDealScore(product);
  const bestIsAliExpress = best?.store === "aliexpress";
  const amazonAsin = getAmazonAsinFromOffers(product.offers);

  return (
    <article
      className={`card-hover group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card ${
        featured ? "ring-1 ring-indigo-500/30" : ""
      }`}
    >
      <Link href={`/producto/${product.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          asin={amazonAsin}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        {showDiscount ? (
          <span className="absolute left-3 top-3 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-2.5 py-1 text-xs font-bold shadow-lg">
            -{product.discount}%
          </span>
        ) : orientative ? (
          <span className="absolute left-3 top-3 rounded-lg bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold text-black shadow-lg">
            Precio orientativo
          </span>
        ) : product.listingKind === "catalog" ? (
          <span className="absolute left-3 top-3 rounded-lg bg-indigo-500/90 px-2.5 py-1 text-xs font-bold shadow-lg">
            Catálogo
          </span>
        ) : null}
        <span className="absolute right-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
          {product.badge}
        </span>
        <div className="absolute bottom-3 right-3">
          <DealScoreMini score={dealScore} />
        </div>
        {product.dealOfDay && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black">
            ⚡ OFERTA DEL DÍA
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-0.5 text-amber-400">
            {"★".repeat(Math.round(product.rating))}
            <span className="ml-1 text-slate-400">{product.rating}</span>
          </span>
          <span>·</span>
          <span>{formatReviews(product.reviews)} opiniones</span>
        </div>

        <Link href={`/producto/${product.id}`}>
          <h3 className="line-clamp-2 font-semibold leading-snug transition group-hover:text-indigo-300">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{product.description}</p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {product.offers.slice(0, 3).map((offer) => {
              const store = config.stores[offer.store];
              return (
                <span
                  key={offer.store}
                  className="store-badge"
                  style={{ backgroundColor: `${store.color}18`, color: store.color }}
                >
                  {store.label}
                </span>
              );
            })}
            {product.offers.length > 3 && (
              <span className="store-badge bg-white/5 text-slate-500">+{product.offers.length - 3}</span>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-500">{storeCount} tiendas</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/5 pt-4">
          <div>
            {lowest > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {orientative ? "Desde (orientativo)" : "Mejor precio"}
                </p>
                <p className="text-xl font-bold text-emerald-400">{formatPrice(lowest)}</p>
                {savings > 0 && (
                  <p className="text-[10px] text-rose-400">Ahorras {formatPrice(savings)}</p>
                )}
                {bestRefurb && bestRefurb.price > 0 && (
                  <p className="text-[10px] text-amber-400/90">
                    ♻️ Renovado desde {formatPrice(bestRefurb.price)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-indigo-400">Comparar tiendas</p>
            )}
          </div>
          {best && isDirectPurchaseOffer(best) ? (
            <AffiliateLink
              href={buildAffiliateUrl(best, product.id)}
              productId={product.id}
              store={best.store}
              className={`px-4 py-2.5 text-xs ${
                bestIsAliExpress
                  ? "rounded-xl bg-[#E43225] font-bold text-white shadow-lg transition hover:opacity-90"
                  : "btn-primary"
              }`}
            >
              {config.stores[best.store]?.label ?? best.store} →
            </AffiliateLink>
          ) : best && best.store === "aliexpress" ? (
            <AffiliateLink
              href={buildAffiliateUrl(best, product.id)}
              productId={product.id}
              store="aliexpress"
              className="rounded-xl bg-[#E43225] px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              AliExpress →
            </AffiliateLink>
          ) : (
            <Link
              href={`/producto/${product.id}`}
              className="btn-secondary px-4 py-2.5 text-xs text-indigo-300"
            >
              Ver tiendas →
            </Link>
          )}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <CompareToggleButton productId={product.id} name={product.name} image={product.image} />
          <Link
            href={`/comparar?a=${product.id}`}
            className="text-[10px] font-medium text-slate-500 opacity-0 transition group-hover:opacity-100 hover:text-indigo-400"
          >
            Duelo →
          </Link>
        </div>
      </div>
    </article>
  );
}
