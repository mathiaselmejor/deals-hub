import { formatPrice, getCatalog } from "@/lib/products";
import type { Product, ProductOffer } from "@/lib/types";

function hasDirectNewOffer(product: Product): boolean {
  return product.offers.some(
    (o) => o.condition !== "refurbished" && o.linkKind === "direct",
  );
}

export function ProductTransparency({ product }: { product: Product }) {
  const catalog = getCatalog();
  const direct = hasDirectNewOffer(product);
  const estimated = product.offers.filter(
    (o) => o.condition !== "refurbished" && o.priceEstimated,
  ).length;

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-sm">
      <h3 className="font-bold text-amber-200">Transparencia de precios</h3>
      <ul className="mt-2 space-y-2 text-slate-300">
        <li>
          {direct ? (
            <>
              <span className="text-emerald-400">✓ Enlace a ficha de producto</span> — al pulsar
              comprar vas al artículo concreto, no solo a una búsqueda.
            </>
          ) : (
            <>
              <span className="text-amber-400">⚠ Enlace a listado de búsqueda</span> — el precio
              mostrado ({formatPrice(product.price)}) es orientativo; confirma en la tienda antes
              de pagar.
            </>
          )}
        </li>
        {estimated > 0 && (
          <li>
            {estimated} tienda(s) muestran precio estimado hasta la próxima verificación automática.
          </li>
        )}
        {product.priceUpdatedAt && (
          <li>
            Precios revisados:{" "}
            <time dateTime={product.priceUpdatedAt}>
              {new Date(product.priceUpdatedAt).toLocaleString("es-ES")}
            </time>
          </li>
        )}
        <li>Catálogo global actualizado: {catalog.lastUpdated}</li>
        <li>
          DealsHub gana una comisión si compras sin coste extra para ti. Los precios los fija cada
          tienda.
        </li>
      </ul>
    </div>
  );
}

export function OfferLinkBadge({ offer }: { offer: ProductOffer }) {
  if (offer.condition === "refurbished") {
    return (
      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
        ♻️ Reacondicionado
      </span>
    );
  }
  if (offer.linkKind === "direct") {
    return (
      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
        ✓ Ficha producto
      </span>
    );
  }
  return (
    <span className="rounded bg-slate-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
      Búsqueda — verificar precio
    </span>
  );
}
