import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Breadcrumbs } from "@/components/RelatedProducts";
import { HowItWorksStrip } from "@/components/HowItWorksStrip";
import {
  formatPrice,
  getAffiliateConfig,
  getAliExpressOffer,
  getAliExpressProducts,
  getCatalog,
} from "@/lib/products";
import { getAliExpressMonetizationStatus } from "@/lib/affiliate";
import { buildAffiliateUrl } from "@/lib/catalog-formatters";
import { AffiliateLink } from "@/components/AffiliateLink";

export const metadata = {
  title: "Ofertas AliExpress — Precios de fábrica con afiliado activo",
  description:
    "Chollos AliExpress con enlaces de afiliado Portals verificados. Compara con Amazon y compra con comisión activa.",
};

export default function AliExpressPage() {
  const products = getAliExpressProducts();
  const catalog = getCatalog();
  const config = getAffiliateConfig();
  const aeStore = config.stores.aliexpress;
  const portals = getAliExpressMonetizationStatus();
  const totalSavings = products.reduce((sum, p) => {
    const ae = getAliExpressOffer(p);
    const amazon = p.offers.find((o) => o.store === "amazon");
    if (ae && amazon && amazon.price > ae.price) return sum + (amazon.price - ae.price);
    return sum;
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 md:pb-10">
      <Breadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "AliExpress" }]}
      />

      <section className="mt-6 overflow-hidden rounded-3xl border border-[#E43225]/35 bg-gradient-to-br from-[#E43225]/15 via-card to-orange-500/5 p-8 mesh-bg">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ff6b5e]">
              AliExpress Portals · afiliado activo
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              🛒 Ofertas AliExpress en DealsHub
            </h1>
            <p className="mt-3 text-slate-400">
              Precios directos de fábrica con{" "}
              <strong className="text-white">enlaces de afiliado verificados</strong>. Cada clic pasa
              por <code className="text-[#ff6b5e]">s.click.aliexpress.com</code> con tu tracking ID
              {portals.configured ? " configurado" : " (pendiente en Vercel)"}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  portals.configured
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {portals.configured ? "✓ Monetización activa" : "○ Configura NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID"}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-slate-400">
                {products.length} productos
              </span>
              {totalSavings > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400">
                  Hasta {formatPrice(totalSavings)} menos vs Amazon en selección
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm">
            <p className="font-semibold" style={{ color: aeStore.color }}>
              Cómo ganamos comisión
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-slate-400">
              <li>Pulsas &quot;Comprar en AliExpress&quot;</li>
              <li>Redirección afiliada Portals (deep link)</li>
              <li>Compras en AliExpress sin coste extra</li>
              <li>Comisión registrada en tu panel Portals</li>
            </ol>
            <a
              href="https://portals.aliexpress.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xs font-semibold text-[#ff6b5e] hover:underline"
            >
              Abrir panel AliExpress Portals →
            </a>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          eyebrow="Catálogo AliExpress"
          title="Todos los chollos con enlace afiliado"
          description="Comparamos también con Amazon u otras tiendas en cada ficha. Los precios en listados AliExpress son orientativos hasta confirmar en la tienda."
          accent="rose"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const ae = getAliExpressOffer(p);
            return (
              <div key={p.id} className="relative">
                <ProductCard product={p} featured />
                {ae && portals.configured && (
                  <AffiliateLink
                    href={buildAffiliateUrl(ae, p.id)}
                    productId={p.id}
                    store="aliexpress"
                    className="mt-2 block w-full rounded-xl bg-[#E43225] py-2.5 text-center text-xs font-bold text-white transition hover:opacity-90"
                  >
                    Comprar en AliExpress — {formatPrice(ae.price)}
                  </AffiliateLink>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {products.length === 0 && (
        <p className="py-16 text-center text-slate-400">
          Añade productos en <code>data/extra-products-aliexpress.json</code>
        </p>
      )}

      <div className="mt-12 rounded-2xl border border-white/10 bg-card/50 p-6 text-sm text-slate-400">
        <p>
          <strong className="text-slate-300">Variables de entorno (producción):</strong>{" "}
          <code>NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID</code>
          {portals.trackingId && ` (${portals.trackingId})`},{" "}
          <code>NEXT_PUBLIC_ALIEXPRESS_TRACKING_NAME={portals.trackingName}</code>
        </p>
        <p className="mt-2">
          Catálogo global: {catalog.products.length} productos · Actualizado {catalog.lastUpdated}
        </p>
        <Link href="/" className="mt-4 inline-block text-indigo-400 hover:underline">
          ← Volver al comparador principal
        </Link>
      </div>

      <HowItWorksStrip compact />
    </div>
  );
}
