import Link from "next/link";
import { getAffiliateConfig, getCatalog } from "@/lib/products";

export function Footer({ disclaimer }: { disclaimer: string }) {
  const catalog = getCatalog();
  const config = getAffiliateConfig();
  const stores = Object.values(config.stores);

  return (
    <footer className="mt-20 border-t border-white/5 bg-surface-2/80">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-sm">
                🔥
              </div>
              <span className="text-lg font-bold">
                Deals<span className="text-indigo-400">Hub</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Comparador de ofertas independiente. Comparamos precios en {stores.length} tiendas
              para que encuentres el mejor chollo sin perder tiempo.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              {catalog.products.length} productos · Actualizado {catalog.lastUpdated}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Explorar</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link href="/#ofertas" className="hover:text-indigo-400">Todas las ofertas</Link></li>
              <li><Link href="/rankings" className="hover:text-indigo-400">Rankings 2026</Link></li>
              <li><Link href="/videos" className="hover:text-indigo-400">Guiones de vídeo</Link></li>
              <li><Link href="/guia-afiliados" className="hover:text-indigo-400">Guía afiliados</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Tiendas</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {stores.slice(0, 6).map((s) => (
                <li key={s.label}>{s.label}</li>
              ))}
              <li className="text-slate-600">+{stores.length - 6} más</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-white/5 bg-card/50 p-4">
          <p className="text-xs leading-relaxed text-slate-500">{disclaimer}</p>
          <p className="mt-2 text-xs text-slate-600">
            Los precios mostrados son orientativos y pueden variar. Comprueba siempre el precio
            final en la tienda antes de comprar.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} DealsHub España
        </p>
      </div>
    </footer>
  );
}
