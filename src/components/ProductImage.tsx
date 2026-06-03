"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { amazonProductImageUrl } from "@/lib/direct-links";
import { getAmazonAsinFromOffers } from "@/lib/product-images";

const PLACEHOLDER = "/placeholder-product.svg";

function shouldUnoptimize(src: string): boolean {
  return (
    src.includes("media-amazon.com") ||
    src.includes("amazon-adsystem.com") ||
    src.includes("ssl-images-amazon.com") ||
    src.startsWith("/")
  );
}

function buildFallbackChain(src: string, asin?: string | null): string[] {
  const chain: string[] = [];
  const trimmed = src?.trim() ?? "";
  const isPlaceholder = !trimmed || trimmed.includes("placeholder");

  if (asin) {
    const widget = amazonProductImageUrl(asin);
    chain.push(widget);
  }
  if (trimmed && !isPlaceholder && !chain.includes(trimmed)) {
    chain.push(trimmed);
  }
  if (!chain.includes(PLACEHOLDER)) chain.push(PLACEHOLDER);
  return chain;
}

type ProductImageProps = {
  src: string;
  alt: string;
  asin?: string | null;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({
  src,
  alt,
  asin,
  fill,
  width,
  height,
  sizes,
  className,
  priority,
}: ProductImageProps) {
  const chain = useMemo(() => buildFallbackChain(src, asin), [src, asin]);
  const [index, setIndex] = useState(0);
  const current = chain[Math.min(index, chain.length - 1)];

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={shouldUnoptimize(current)}
      onError={() => setIndex((i) => (i < chain.length - 1 ? i + 1 : i))}
    />
  );
}

export { getAmazonAsinFromOffers as getAmazonAsinFromProduct };
