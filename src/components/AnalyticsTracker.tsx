"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("dh_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("dh_session", id);
  }
  return id;
}

export function trackEvent(
  event_type: string,
  payload: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type,
      payload,
      session_id: getSessionId(),
      path: window.location.pathname,
    }),
  }).catch(() => {});
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", { pathname });
  }, [pathname]);

  return null;
}
