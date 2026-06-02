const STEPS = [
  {
    step: "01",
    icon: "🔍",
    title: "Busca o explora",
    body: "Encuentra el producto en nuestro catálogo o usa el buscador inteligente.",
  },
  {
    step: "02",
    icon: "⚖️",
    title: "Compara precios",
    body: "Vemos Amazon, MediaMarkt, Fnac, PcComponentes y más — en una sola ficha.",
  },
  {
    step: "03",
    icon: "🛒",
    title: "Compra al mejor precio",
    body: "Enlace directo a la tienda ganadora. Sin coste extra por usar DealsHub.",
  },
];

export function HowItWorksStrip({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "py-6" : "py-10"}>
      <div className="mx-auto max-w-7xl px-4">
        {!compact && (
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Cómo funciona
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Como Idealo o Kelkoo, pero más claro
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              Tres pasos para no pagar de más — comparación real en tiendas españolas.
            </p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((item, i) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-white/10 bg-card/80 p-5 transition hover:border-indigo-500/30"
            >
              {!compact && i < STEPS.length - 1 && (
                <span
                  className="absolute -right-2 top-1/2 hidden translate-x-full -translate-y-1/2 text-slate-600 sm:block"
                  aria-hidden
                >
                  →
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-lg">
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Paso {item.step}
                </span>
              </div>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
