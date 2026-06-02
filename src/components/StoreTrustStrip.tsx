import { getAffiliateConfig } from "@/lib/products";

export function StoreTrustStrip() {
  const config = getAffiliateConfig();
  const stores = Object.values(config.stores);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/50 py-4">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Comparamos precios en
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4">
        {stores.map((store) => (
          <span
            key={store.label}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition hover:scale-105"
            style={{
              backgroundColor: `${store.color}15`,
              color: store.color,
              border: `1px solid ${store.color}30`,
            }}
          >
            {store.label}
          </span>
        ))}
      </div>
    </div>
  );
}
