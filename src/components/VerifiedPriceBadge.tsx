import { hasVerifiedPricing } from "@/lib/products";
import type { Product } from "@/lib/types";

function formatChecked(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const hours = Math.round((Date.now() - d.getTime()) / 3600000);
  if (hours < 1) return "hace unos minutos";
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export function VerifiedPriceBadge({ product }: { product: Product }) {
  const verified = hasVerifiedPricing(product);
  const amazon = product.offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished");
  const checked = formatChecked(product.priceUpdatedAt ?? amazon?.lastChecked);

  if (verified) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
        <p className="font-semibold text-emerald-400">✓ Precio verificado en tienda</p>
        {checked && <p className="mt-1 text-xs text-slate-400">Comprobado {checked}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
      <p className="font-semibold text-amber-300">Precio orientativo</p>
      <p className="mt-1 text-xs text-amber-200/70">
        Confirma el importe final en la tienda antes de comprar.
      </p>
    </div>
  );
}
