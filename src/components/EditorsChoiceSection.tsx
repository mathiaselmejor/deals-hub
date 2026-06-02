import Image from "next/image";
import Link from "next/link";
import { computeDealScore, getDealScoreLabel } from "@/lib/algorithms";
import { formatPrice, getLowestPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

export function EditorsChoiceSection({ products }: { products: Product[] }) {
  const picks = products.slice(0, 3);
  if (picks.length === 0) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {picks.map((product, i) => {
        const score = computeDealScore(product);
        const meta = getDealScoreLabel(score);
        const price = getLowestPrice(product) || product.price;
        const labels = ["🏆 Mejor elección", "⭐ También genial", "💡 Buena alternativa"];

        return (
          <article
            key={product.id}
            className={`editorial-card overflow-hidden rounded-2xl border ${
              i === 0
                ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-card ring-1 ring-emerald-500/20"
                : "border-white/10 bg-card"
            }`}
          >
            <div className="p-5 pb-0">
              <span
                className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  i === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"
                }`}
              >
                {labels[i]}
              </span>
              <Link href={`/producto/${product.id}`}>
                <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug hover:text-indigo-300">
                  {product.name}
                </h3>
              </Link>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.description}</p>
            </div>

            <Link href={`/producto/${product.id}`} className="relative mt-4 block aspect-[16/10]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              {product.discount > 0 && (
                <span className="absolute left-3 top-3 rounded-lg bg-rose-500 px-2 py-1 text-xs font-bold">
                  -{product.discount}%
                </span>
              )}
            </Link>

            <div className="flex items-end justify-between gap-3 p-5">
              <div>
                <p className={`text-xs font-semibold ${meta.color}`}>
                  Deal Score {score} · {meta.label}
                </p>
                {price > 0 && (
                  <p className="mt-1 text-xl font-bold text-emerald-400">{formatPrice(price)}</p>
                )}
              </div>
              <Link
                href={`/producto/${product.id}`}
                className="btn-primary shrink-0 px-4 py-2 text-xs"
              >
                Ver ofertas
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
