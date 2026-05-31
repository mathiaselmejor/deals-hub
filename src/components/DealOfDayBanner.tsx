import Link from "next/link";
import {
  buildAffiliateUrl,
  formatPrice,
  getBestOffer,
  getDealOfDay,
  getSavings,
} from "@/lib/products";

export function DealOfDayBanner() {
  const deal = getDealOfDay();
  if (!deal) return null;

  const best = getBestOffer(deal);
  const savings = getSavings(deal);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr_auto] sm:p-8">
          <div className="flex items-center gap-2">
            <span className="animate-pulse rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black">
              ⚡ OFERTA DEL DÍA
            </span>
          </div>

          <div className="flex items-center gap-5">
            <img
              src={deal.image}
              alt={deal.name}
              className="h-20 w-20 rounded-xl object-cover shadow-lg sm:h-24 sm:w-24"
            />
            <div>
              <h3 className="font-bold sm:text-lg">{deal.name}</h3>
              <p className="mt-1 text-sm text-slate-400 line-clamp-2">{deal.description}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">{formatPrice(deal.price)}</span>
                <span className="text-sm text-slate-500 line-through">{formatPrice(deal.originalPrice)}</span>
                {savings > 0 && (
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                    Ahorras {formatPrice(savings)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/producto/${deal.id}`}
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/5"
            >
              Comparar tiendas
            </Link>
            {best && (
              <a
                href={buildAffiliateUrl(best)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-black shadow-lg transition hover:opacity-90"
              >
                Comprar ahora →
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
