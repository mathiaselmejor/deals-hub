import { Suspense } from "react";
import { HowItWorksStrip } from "@/components/HowItWorksStrip";
import { ImageSearchPanel } from "@/components/ImageSearchPanel";
import { StoreTrustStrip } from "@/components/StoreTrustStrip";
import { Breadcrumbs } from "@/components/RelatedProducts";
import { getCatalog } from "@/lib/products";

export const metadata = {
  title: "Buscar por imagen",
  description:
    "Sube una foto del producto y encuentra ofertas aunque no sepas cómo se llama. Comparador DealsHub.",
};

export default function BuscarImagenPage() {
  const catalog = getCatalog();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Buscar", href: "/buscar" },
          { label: "Por imagen" },
        ]}
      />

      <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-card p-8 mesh-bg">
        <h1 className="text-3xl font-bold sm:text-4xl">📷 Buscar por imagen</h1>
        <p className="mt-2 text-slate-400">
          Sube una foto y buscamos en {catalog.products.length} productos de tiendas afiliadas en
          España — ideal si viste algo en redes o en una tienda y no sabes el nombre exacto.
        </p>
      </section>

      <div className="mt-8">
        <Suspense fallback={<div className="skeleton-shimmer h-48 rounded-2xl" />}>
          <ImageSearchPanel />
        </Suspense>
      </div>

      <div className="mt-12">
        <StoreTrustStrip />
      </div>

      <HowItWorksStrip compact />
    </div>
  );
}
