"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("dealshub-session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("dealshub-session", id);
  }
  return id;
}

export function InteractionTracker({ productId }: { productId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getSessionId();
    const payload: Record<string, string> = { path: pathname };

    if (productId) {
      fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalType: "view", productId, sessionId, payload }),
      }).catch(() => {});
    }
  }, [pathname, productId]);

  return null;
}

export function trackSearch(query: string) {
  fetch("/api/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signalType: "search",
      sessionId: getSessionId(),
      payload: { query },
    }),
  }).catch(() => {});
}
