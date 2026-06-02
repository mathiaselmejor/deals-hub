import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getCategoriesWithCounts, getProductsByCategory } from "@/lib/products";

const RAIL_LIMIT = 4;
const MAX_RAILS = 10;

export function CategoryRails() {
  const topCategories = getCategoriesWithCounts()
    .filter((c) => c.count >= RAIL_LIMIT)
    .slice(0, MAX_RAILS);

  if (topCategories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl space-y-14 px-4 py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Compra por categoría</h2>
        <p className="mt-2 text-sm text-slate-400">
          Miles de comparativas — elige tu sección y encuentra el mejor precio al instante
        </p>
      </div>

      {topCategories.map((cat) => {
        const items = getProductsByCategory(cat.id).slice(0, RAIL_LIMIT);
        return (
          <div key={cat.id}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden>
                  {cat.icon}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{cat.label}</h3>
                  {cat.description && (
                    <p className="mt-0.5 max-w-xl text-sm text-slate-400">{cat.description}</p>
                  )}
                  <p className="mt-1 text-xs text-indigo-400">{cat.count} ofertas</p>
                </div>
              </div>
              <Link
                href={`/categoria/${cat.id}`}
                className="shrink-0 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
              >
                Ver todo {cat.label.toLowerCase()} →
              </Link>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
