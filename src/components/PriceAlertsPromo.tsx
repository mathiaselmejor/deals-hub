import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice, getProductById } from "@/lib/products";
import { getAmazonAsinFromOffers } from "@/lib/product-images";

export function PriceAlertsPromo() {
  const demo = getProductById("apple-airpods-pro-2-usb-c");
  const current = demo?.price ?? 249;
  const target = Math.round(current * 0.88);
  const triggered = Math.max(target - 1, Math.round(current * 0.87));
  const progress = Math.min(100, Math.round(((current - triggered) / (current - target)) * 100));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-indigo-500/10 p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Nuevo · Alertas de precio
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Te avisamos cuando baje el precio
            </h2>
            <p className="mt-3 text-slate-400">
              Elige tu precio objetivo en cualquier producto. Comprobamos el catálogo cada 2 horas y te
              enviamos un email cuando llegue — sin refrescar la página a diario.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              <li>✓ Chips rápidos −5%, −10%, −15% desde el precio actual</li>
              <li>✓ Panel en Mi cuenta con barra de progreso</li>
              <li>✓ Alerta por email sin cuenta (solo deja tu correo)</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/buscar" className="btn-primary px-6 py-3 text-sm">
                Buscar producto →
              </Link>
              <Link href="/cuenta" className="btn-secondary px-6 py-3 text-sm">
                Mis alertas
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              className="glow-orb -right-6 top-8 h-32 w-32 bg-emerald-500/20 animate-pulse-glow"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/40 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                  Vista previa en vivo
                </span>
                <span className="text-xs text-slate-500">Comprobado hace 2 h</span>
              </div>

              {demo && (
                <div className="mt-4 flex gap-4 rounded-xl border border-white/5 bg-black/20 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
                    <ProductImage
                      src={demo.image}
                      alt={demo.name}
                      asin={getAmazonAsinFromOffers(demo.offers)}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                      {demo.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Amazon · alerta activa</p>
                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      <span className="text-lg font-bold text-white">{formatPrice(current)}</span>
                      <span className="text-xs text-slate-500">precio actual</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Objetivo</span>
                  <span className="font-semibold text-emerald-400">≤ {formatPrice(target)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-500">
                  A {formatPrice(current - triggered)} de tu alerta
                </p>
              </div>

              <div className="animate-float mt-5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 p-4 shadow-lg shadow-emerald-500/10">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-lg">
                    🔔
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-100">¡Precio alcanzado!</p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-200/80">
                      {demo?.name.split(" ").slice(0, 3).join(" ") ?? "Producto"} ya a{" "}
                      <strong className="text-white">{formatPrice(triggered)}</strong> — te enviamos
                      email y aviso en tu cuenta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
