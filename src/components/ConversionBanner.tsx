import Link from "next/link";
import { getAffiliateConfig, getCatalog } from "@/lib/products";

export function ConversionBanner() {
  const catalog = getCatalog();
  const config = getAffiliateConfig();
  const storeCount = Object.keys(config.stores).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Comparador activo
            </p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              {catalog.products.length}+ productos · {storeCount} tiendas comparadas
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Cada clic en &quot;Comprar&quot; te lleva a la tienda con mejor precio. En Amazon
              generamos comisión sin coste extra para ti — así mantenemos DealsHub gratis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#ofertas"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
            >
              Ver todas las ofertas
            </Link>
            <Link
              href="/guia-afiliados"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold transition hover:bg-white/5"
            >
              Cómo funciona
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
