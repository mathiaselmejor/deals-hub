import { AffiliateLink } from "@/components/AffiliateLink";
import { OfferLinkBadge } from "@/components/ProductTransparency";
import {
  buildAffiliateUrl,
  formatPrice,
  getAffiliateConfig,
  getBestOffer,
  getBestRefurbishedOffer,
  getNewOffers,
  getRefurbishedOffers,
} from "@/lib/products";
import type { Product, ProductOffer } from "@/lib/types";

function OfferRow({
  offer,
  product,
  index,
  bestNewPrice,
  variant,
}: {
  offer: ProductOffer;
  product: Product;
  index: number;
  bestNewPrice: number;
  variant: "new" | "refurbished";
}) {
  const config = getAffiliateConfig();
  const store = config.stores[offer.store];
  const priceDiff =
    variant === "new" && offer.price > 0 && bestNewPrice > 0
      ? offer.price - bestNewPrice
      : 0;
  const isBestNew = variant === "new" && index === 0 && offer.price > 0;

  return (
    <AffiliateLink
      href={buildAffiliateUrl(offer, product.id)}
      productId={product.id}
      store={offer.store}
      className={`group flex items-center justify-between rounded-xl border p-4 transition hover:border-indigo-500/50 ${
        isBestNew
          ? "border-emerald-500/40 bg-emerald-500/5"
          : variant === "refurbished"
            ? "border-amber-500/25 bg-amber-500/5"
            : "border-white/10 bg-card"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold"
          style={{ backgroundColor: `${store.color}20`, color: store.color }}
        >
          {store.label.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <span className="font-semibold" style={{ color: store.color }}>
            {store.label}
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            <OfferLinkBadge offer={offer} />
          </div>
          {offer.note && <p className="text-xs text-slate-500">{offer.note}</p>}
          {offer.priceEstimated && offer.price > 0 && (
            <p className="text-xs text-amber-400/80">Precio orientativo</p>
          )}
          {isBestNew && (
            <p className="text-xs font-medium text-emerald-400">✓ Mejor precio — nuevo</p>
          )}
          {priceDiff > 0 && index > 0 && variant === "new" && (
            <p className="text-xs text-rose-400/80">+{formatPrice(priceDiff)} vs mejor</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">
          {offer.price > 0 ? formatPrice(offer.price) : "Ver en tienda"}
        </span>
        <span
          className={`rounded-lg px-4 py-2 text-xs font-bold text-white shadow-lg transition group-hover:opacity-90 ${
            variant === "refurbished"
              ? "bg-gradient-to-r from-amber-600 to-orange-600"
              : "bg-gradient-to-r from-indigo-500 to-emerald-500"
          }`}
        >
          {isBestNew ? "Comprar nuevo →" : variant === "refurbished" ? "Ver renovado →" : "Ir a tienda →"}
        </span>
      </div>
    </AffiliateLink>
  );
}

export function StoreOffersPanel({ product }: { product: Product }) {
  const newOffers = getNewOffers(product)
    .filter((o) => o.price > 0)
    .sort((a, b) => a.price - b.price);
  const zeroPriceNew = getNewOffers(product).filter((o) => o.price === 0);
  const refurbished = getRefurbishedOffers(product);
  const bestNew = getBestOffer(product);
  const bestRefurb = getBestRefurbishedOffer(product);
  const bestNewPrice = bestNew?.price ?? 0;

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h2 className="text-lg font-bold">Comprar nuevo — recomendado</h2>
        <p className="mt-1 text-sm text-slate-400">
          Producto nuevo en tiendas afiliadas. Comisión sin coste extra para ti.
        </p>
        <div className="mt-4 space-y-3">
          {[...newOffers, ...zeroPriceNew].map((offer, i) => (
            <OfferRow
              key={`${offer.store}-new-${i}`}
              offer={offer}
              product={product}
              index={i}
              bestNewPrice={bestNewPrice}
              variant="new"
            />
          ))}
        </div>
      </div>

      {refurbished.length > 0 && (
        <div>
          <h2 className="text-lg font-bold">♻️ Reacondicionado / segunda mano</h2>
          <p className="mt-1 text-sm text-slate-400">
            Alternativas renovadas o certificadas — suelen costar menos. Revisa el estado en cada
            tienda antes de comprar.
          </p>
          {bestRefurb && bestNew && bestRefurb.price > 0 && bestNew.price > 0 && (
            <p className="mt-2 text-sm text-amber-400/90">
              Ahorro estimado vs nuevo: {formatPrice(Math.max(0, bestNew.price - bestRefurb.price))}
            </p>
          )}
          <div className="mt-4 space-y-3">
            {refurbished.map((offer, i) => (
              <OfferRow
                key={`${offer.store}-refurb-${i}`}
                offer={offer}
                product={product}
                index={i}
                bestNewPrice={bestNewPrice}
                variant="refurbished"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
