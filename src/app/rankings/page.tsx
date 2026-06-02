import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { getTopLists } from "@/lib/products";

export const metadata = {
  title: "Rankings 2026 — Mejores productos por categoría",
  description: "Comparativas curadas de los mejores productos en España con precios actualizados.",
};

export default function RankingsPage() {
  const lists = getTopLists();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-card p-8 mesh-bg">
        <h1 className="text-3xl font-bold sm:text-4xl">🏆 Rankings 2026</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Comparativas curadas estilo Wirecutter: los productos más vendidos y mejor valorados en
          España, con precios comparados en múltiples tiendas.
        </p>
      </section>

      <div className="mt-10">
        <SectionHeader
          eyebrow="Editorial"
          title="Listas por categoría"
          description="Selección basada en Deal Score, valoraciones y disponibilidad en tiendas afiliadas."
          accent="amber"
        />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {lists.map((list, i) => (
          <Link
            key={list.slug}
            href={`/rankings/${list.slug}`}
            className="card-hover group rounded-2xl border border-white/10 bg-card p-6"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl font-bold text-indigo-500/30">#{i + 1}</span>
              <span className="rounded-lg bg-indigo-500/20 px-2 py-1 text-xs font-bold text-indigo-300">
                {list.productIds.length} productos
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold group-hover:text-indigo-300">{list.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{list.description}</p>
            <p className="mt-4 text-sm font-semibold text-indigo-400">Ver ranking →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
