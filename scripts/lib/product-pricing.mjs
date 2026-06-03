/** Misma lógica que src/lib/product-pricing.ts — para scripts Node. */

export function getNewOffersWithPrice(product) {
  return (product.offers ?? []).filter(
    (o) => o.condition !== "refurbished" && o.price > 0,
  );
}

export function hasVerifiedPricing(product) {
  const offers = getNewOffersWithPrice(product);
  if (!offers.length) return false;
  const display = Math.min(...offers.map((o) => o.price));
  return offers.some(
    (o) => o.priceEstimated === false && Math.abs(o.price - display) < 0.02,
  );
}

function isMassCatalogId(id) {
  return typeof id === "string" && /^c[6-9]-/.test(id);
}

export function applyConsistentProductPricing(product) {
  const offers = getNewOffersWithPrice(product);
  if (!offers.length) return product;

  const price = Math.min(...offers.map((o) => o.price));

  if (isMassCatalogId(product.id)) {
    return {
      ...product,
      price,
      originalPrice: price,
      discount: 0,
      listingKind: "catalog",
    };
  }

  const verified = hasVerifiedPricing({ ...product, offers: product.offers });

  let originalPrice = product.originalPrice;
  let discount = product.discount ?? 0;

  if (!verified) {
    originalPrice = price;
    discount = 0;
  } else if (originalPrice <= price + 0.5) {
    originalPrice = price;
    discount = 0;
  } else {
    discount = Math.round((1 - price / originalPrice) * 100);
  }

  return {
    ...product,
    price,
    originalPrice,
    discount,
  };
}
