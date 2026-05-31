import Link from "next/link";
import {
  buildAffiliateUrl,
  formatPrice,
  formatReviews,
  getAffiliateConfig,
  getBestOffer,
  getLowestPrice,
  getSavings,
} from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const config = getAffiliateConfig();
  const lowest = getLowestPrice(product);
  const best = getBestOffer(product);
  const savings = getSavings(product);

  return (
    <article
      className={`card-hover group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card ${
        featured ? "ring-1 ring-indigo-500/30" : ""
      }`}
    >
      <Link href={`/producto/${product.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-2.5 py-1 text-xs font-bold shadow-lg">
            -{product.discount}%
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
          {product.badge}
        </span>
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

        <div className="mt-3 flex flex-wrap gap-1">
          {product.offers.slice(0, 4).map((offer) => {
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
          {product.offers.length > 4 && (
            <span className="store-badge bg-white/5 text-slate-500">+{product.offers.length - 4}</span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/5 pt-4">
          <div>
            {lowest > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Mejor precio</p>
                <p className="text-xl font-bold text-emerald-400">{formatPrice(lowest)}</p>
                {savings > 0 && (
                  <p className="text-[10px] text-rose-400">Ahorras {formatPrice(savings)}</p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-indigo-400">Comparar tiendas</p>
            )}
          </div>
          {best && (
            <a
              href={buildAffiliateUrl(best)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-bold shadow-lg shadow-indigo-500/20 transition hover:opacity-90"
            >
              Comprar →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
