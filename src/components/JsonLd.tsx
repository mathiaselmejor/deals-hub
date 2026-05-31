import type { Product } from "@/lib/types";
import { getCatalog } from "@/lib/products";

export function JsonLd({ product }: { product?: Product }) {
  const catalog = getCatalog();

  if (product) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.image,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews,
      },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: product.price,
        highPrice: product.originalPrice,
        priceCurrency: "EUR",
        offerCount: product.offers.length,
      },
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DealsHub España",
    description: "Comparador de ofertas multi-tienda en España",
    url: "https://dealshub.es",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://dealshub.es/#ofertas?q={search_term_string}",
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
