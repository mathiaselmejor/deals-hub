"use client";

import { trackEvent } from "@/components/AnalyticsTracker";

type Props = {
  href: string;
  productId: string;
  store: string;
  className?: string;
  children: React.ReactNode;
};

function hrefWithReferral(base: string): string {
  if (typeof document === "undefined") return base;
  const fromCookie = document.cookie.match(/(?:^|;\s*)dh_ref=([^;]+)/)?.[1];
  const fromStorage =
    typeof localStorage !== "undefined" ? localStorage.getItem("dh_ref") : null;
  const ref = (fromCookie ?? fromStorage)?.trim().toUpperCase();
  if (!ref) return base;
  try {
    const u = new URL(base);
    u.searchParams.set("utm_term", `ref_${ref}`);
    return u.toString();
  } catch {
    return base;
  }
}

export function AffiliateLink({ href, productId, store, className, children }: Props) {
  const outbound = hrefWithReferral(href);

  const handleClick = () => {
    trackEvent("affiliate_click", { productId, store, href: outbound });
    fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signalType: "click",
        productId,
        payload: { store },
      }),
    }).catch(() => {});
  };

  return (
    <a
      href={outbound}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
