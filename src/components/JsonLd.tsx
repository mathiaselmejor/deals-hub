import type { Product } from "@/lib/types";
import { getCatalog } from "@/lib/products";

export function JsonLd({ product }: { product?: Product }) {
  const catalog = getCatalog();

  if (product) {
    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.image,
      offers: {
        "@type": "AggregateOffer",
        lowPrice: product.price > 0 ? product.price : undefined,
        highPrice: product.originalPrice > 0 ? product.originalPrice : undefined,
        priceCurrency: "EUR",
        offerCount: product.offers.length,
        availability: "https://schema.org/InStock",
      },
    };
    if (product.rating > 0 && product.reviews > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews,
      };
    }
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://deals-hub-iota.vercel.app";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DealsHub España",
    description: "Comparador de ofertas multi-tienda en España",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    numberOfItems: catalog.products.length,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
