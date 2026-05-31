import { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";
import { Breadcrumbs } from "@/components/RelatedProducts";
import { getCatalog } from "@/lib/products";

export const metadata = {
  title: "Buscar ofertas",
  description: "Busca chollos y compara precios en Amazon, MediaMarkt, PcComponentes y más.",
};

export default function BuscarPage() {
  const catalog = getCatalog();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Buscar ofertas" },
        ]}
      />

      <h1 className="text-3xl font-bold">Buscar ofertas</h1>
      <p className="mt-2 text-slate-400">
        Encuentra al instante todas las ofertas de un producto en varias tiendas
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-card" />}>
          <SearchResults allProducts={catalog.products} />
        </Suspense>
      </div>
    </div>
  );
}
