import type { Metadata } from "next";
import Link from "next/link";
import { getAffiliateDisclaimer } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Información legal de DealsHub España.",
};

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Aviso legal</h1>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-slate-300">
        <h2 className="text-lg font-semibold text-white">Identificación</h2>
        <p>
          DealsHub España — comparador de precios y ofertas. Sitio informativo; las compras se
          realizan en tiendas terceras.
        </p>

        <h2 className="text-lg font-semibold text-white">Precios</h2>
        <p>
          Los precios mostrados son orientativos, basados en datos del catálogo. Comprueba siempre
          el precio final en la tienda antes de comprar.
        </p>

        <h2 className="text-lg font-semibold text-white">Afiliados</h2>
        <p>{getAffiliateDisclaimer()}</p>

        <h2 className="text-lg font-semibold text-white">Propiedad intelectual</h2>
        <p>
          Marcas y logotipos de tiendas pertenecen a sus titulares. El contenido editorial de
          DealsHub (textos, rankings, diseño) está protegido por derechos de autor.
        </p>

        <h2 className="text-lg font-semibold text-white">Enlaces externos</h2>
        <p>
          No somos responsables del contenido ni de las políticas de sitios enlazados.
        </p>
      </section>

      <Link href="/" className="mt-10 inline-block text-indigo-400 hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}
