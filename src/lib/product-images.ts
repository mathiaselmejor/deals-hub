import type { ProductOffer } from "./types";

export function getAmazonAsinFromOffers(
  offers?: Pick<ProductOffer, "store" | "asin" | "condition">[],
): string | null {
  const amazon = offers?.find((o) => o.store === "amazon" && o.condition !== "refurbished");
  return amazon?.asin ?? null;
}
