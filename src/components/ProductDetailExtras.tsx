import type { Product } from "@/lib/types";

const DEFAULT_GUIDE = [
  "Compara siempre el precio final con envío e impuestos.",
  "Revisa valoraciones recientes (últimos 30 días).",
  "En producto reacondicionado, lee el grado (A/B/C) y garantía.",
];

export function ProductDetailExtras({ product }: { product: Product }) {
  const guide = product.buyingGuide?.length ? product.buyingGuide : DEFAULT_GUIDE;
  const faq =
    product.faq?.length ?
      product.faq
    : [
        {
          q: "¿El precio es exacto?",
          a: "Si el botón dice «Ficha producto», el enlace lleva al artículo concreto. Si no, es orientativo hasta que el motor lo verifique de nuevo.",
        },
        {
          q: "¿Por qué varía el precio?",
          a: "Las tiendas cambian precios varias veces al día. Actualizamos el catálogo de forma automática.",
        },
      ];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-card p-5">
        <h2 className="text-lg font-bold">Guía rápida de compra</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          {guide.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
        {product.videoHook && (
          <p className="mt-4 text-xs text-indigo-400">💡 {product.videoHook}</p>
        )}
        {product.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {product.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-card p-5">
        <h2 className="text-lg font-bold">Preguntas frecuentes</h2>
        <dl className="mt-3 space-y-4">
          {faq.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-semibold text-slate-200">{item.q}</dt>
              <dd className="mt-1 text-sm text-slate-400">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
