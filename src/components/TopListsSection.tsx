import Link from "next/link";
import { getCatalog, getTopLists } from "@/lib/products";

export function TopListsSection() {
  const lists = getTopLists();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">🏆 Rankings 2026</h2>
          <p className="mt-1 text-sm text-slate-400">Comparativas curadas por categoría</p>
        </div>
        <Link href="/rankings" className="text-sm text-indigo-400 hover:underline">
          Ver todos →
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <Link
            key={list.slug}
            href={`/rankings/${list.slug}`}
            className="card-hover group rounded-2xl border border-white/10 bg-card p-5"
          >
            <span className="text-2xl">🏆</span>
            <h3 className="mt-3 font-semibold group-hover:text-indigo-300">{list.title}</h3>
            <p className="mt-2 line-clamp-2 text-xs text-slate-500">{list.description}</p>
            <p className="mt-3 text-xs font-medium text-indigo-400">
              {list.productIds.length} productos →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TrustBar() {
  const catalog = getCatalog();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: "🏪", n: "10+", l: "Tiendas comparadas" },
          { icon: "📦", n: `${catalog.products.length}`, l: "Productos activos" },
          { icon: "🏷️", n: `${catalog.categories.length - 1}`, l: "Categorías" },
          { icon: "💰", n: "Hasta 40%", l: "Descuento máximo" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-white/5 bg-card/50 p-4 text-center">
            <p className="text-xl">{s.icon}</p>
            <p className="mt-1 text-xl font-bold">{s.n}</p>
            <p className="text-xs text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
