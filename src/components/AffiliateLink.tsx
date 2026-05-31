"use client";

import { trackEvent } from "@/components/AnalyticsTracker";

type Props = {
  href: string;
  productId: string;
  store: string;
  className?: string;
  children: React.ReactNode;
};

export function AffiliateLink({ href, productId, store, className, children }: Props) {
  const handleClick = () => {
    trackEvent("affiliate_click", { productId, store, href });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
