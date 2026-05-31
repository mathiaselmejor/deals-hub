import { getAffiliateConfig } from "@/lib/products";

export function StoreMarquee() {
  const stores = Object.values(getAffiliateConfig().stores);

  const doubled = [...stores, ...stores];

  return (
    <section className="border-y border-white/5 bg-surface-2/50 py-6 overflow-hidden">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-slate-500">
        Comparamos precios en
      </p>
      <div className="relative">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {doubled.map((store, i) => (
            <span
              key={`${store.label}-${i}`}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: store.color }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: store.color }}
              />
              {store.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
