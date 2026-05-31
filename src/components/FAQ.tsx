"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Los precios son reales?",
    a: "Mostramos precios orientativos basados en las ofertas actuales de cada tienda. Siempre recomendamos verificar el precio final en la web del vendedor antes de comprar, ya que pueden cambiar.",
  },
  {
    q: "¿DealsHub vende productos?",
    a: "No. Somos un comparador independiente. Te redirigimos a tiendas oficiales como Amazon, MediaMarkt o PcComponentes donde realizas la compra directamente.",
  },
  {
    q: "¿Cómo ganáis dinero?",
    a: "Usamos enlaces de afiliado. Si compras a través de nuestros links, recibimos una pequeña comisión de la tienda sin que te cueste nada extra.",
  },
  {
    q: "¿Con qué frecuencia se actualizan las ofertas?",
    a: "Revisamos y actualizamos el catálogo regularmente, especialmente en fechas clave como Prime Day, Black Friday y rebajas de temporada.",
  },
  {
    q: "¿Puedo sugerir un producto?",
    a: "¡Claro! Estamos ampliando el catálogo constantemente con los productos más buscados y vendidos en España.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="text-center text-2xl font-bold">Preguntas frecuentes</h2>
      <p className="mt-2 text-center text-sm text-slate-400">
        Todo lo que necesitas saber sobre DealsHub
      </p>
      <div className="mt-8 space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition hover:bg-white/5"
            >
              {faq.q}
              <span className="ml-4 shrink-0 text-slate-500">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-slate-400">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
