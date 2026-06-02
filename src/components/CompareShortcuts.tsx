import Link from "next/link";
import type { Product } from "@/lib/types";

export function CompareShortcuts({
  product,
  rivals,
}: {
  product: Product;
  rivals: Product[];
}) {
  if (rivals.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
        Comparar como Versus
      </p>
      <h3 className="mt-1 font-semibold">⚔️ Duelo de productos</h3>
      <p className="mt-2 text-sm text-slate-400">
        Compara especificaciones, precio y Deal Score frente a alternativas similares.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {rivals.slice(0, 3).map((rival) => (
          <Link
            key={rival.id}
            href={`/comparar?a=${product.id}&b=${rival.id}`}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:border-indigo-500/40 hover:bg-indigo-500/10"
          >
            vs {rival.name.length > 32 ? `${rival.name.slice(0, 32)}…` : rival.name}
          </Link>
        ))}
        <Link
          href={`/comparar?a=${product.id}`}
          className="rounded-xl border border-indigo-500/30 px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10"
        >
          Elegir otro rival →
        </Link>
      </div>
    </div>
  );
}
