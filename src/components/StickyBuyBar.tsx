"use client";

import {
  buildAffiliateUrl,
  formatPrice,
  getAffiliateConfig,
  getBestOffer,
} from "@/lib/catalog-formatters";
import type { Product } from "@/lib/types";
import { AffiliateLink } from "@/components/AffiliateLink";

export function StickyBuyBar({ product }: { product: Product }) {
  const best = getBestOffer(product);
  const config = getAffiliateConfig();
  if (!best) return null;

  const store = config.stores[best.store];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-500/30 bg-[#0a0a12]/95 p-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="text-lg font-bold text-emerald-400">
            {best.price > 0 ? formatPrice(best.price) : "Ver oferta"}
            <span className="ml-2 text-xs font-normal text-slate-500">{store.label}</span>
          </p>
        </div>
        <AffiliateLink
          href={buildAffiliateUrl(best, product.id)}
          productId={product.id}
          store={best.store}
          className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 px-5 py-3 text-sm font-bold shadow-lg"
        >
          Comprar →
        </AffiliateLink>
      </div>
    </div>
  );
}
