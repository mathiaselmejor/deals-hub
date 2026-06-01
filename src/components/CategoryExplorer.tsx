import Link from "next/link";
import { getCategoriesWithCounts } from "@/lib/products";

export function CategoryExplorer() {
  const categories = getCategoriesWithCounts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Explora por categoría</h2>
        <p className="mt-2 text-sm text-slate-400">
          {categories.reduce((n, c) => n + c.count, 0)}+ ofertas en {categories.length} categorías
        </p>
      </div>
      <div className="mt-8 grid max-h-[28rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:max-h-none sm:grid-cols-3 sm:overflow-visible md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.id}`}
            className="card-hover group rounded-2xl border border-white/10 bg-card p-4 text-center transition"
          >
            <span className="text-3xl">{cat.icon}</span>
            <p className="mt-2 text-sm font-semibold group-hover:text-indigo-300">{cat.label}</p>
            <p className="mt-1 text-xs text-slate-500">{cat.count} ofertas</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
