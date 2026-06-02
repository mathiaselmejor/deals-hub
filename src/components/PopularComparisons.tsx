import Image from "next/image";
import Link from "next/link";
import { POPULAR_COMPARISONS } from "@/lib/popular-comparisons";
import { formatPrice, getProductById, getLowestPrice } from "@/lib/products";

export function PopularComparisons({ limit = 6 }: { limit?: number }) {
  const pairs = POPULAR_COMPARISONS.slice(0, limit);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map((pair) => {
        const productA = getProductById(pair.a);
        const productB = getProductById(pair.b);
        if (!productA || !productB) return null;

        const priceA = getLowestPrice(productA) || productA.price;
        const priceB = getLowestPrice(productB) || productB.price;

        return (
          <Link
            key={`${pair.a}-${pair.b}`}
            href={`/comparar?a=${pair.a}&b=${pair.b}`}
            className="compare-duel-card group rounded-2xl border border-white/10 bg-card p-4 transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {pair.tag}
              </span>
              <span className="text-lg opacity-60 transition group-hover:opacity-100">{pair.emoji}</span>
            </div>

            <p className="mt-3 font-semibold group-hover:text-indigo-300">{pair.label}</p>

            <div className="mt-4 flex items-center gap-2">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
                <Image src={productA.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                VS
              </span>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
                <Image src={productB.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 text-right">
                {priceA > 0 && priceB > 0 && (
                  <p className="text-xs text-slate-500">
                    {formatPrice(Math.min(priceA, priceB))} – {formatPrice(Math.max(priceA, priceB))}
                  </p>
                )}
                <p className="text-xs font-semibold text-indigo-400">Ver duelo →</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
