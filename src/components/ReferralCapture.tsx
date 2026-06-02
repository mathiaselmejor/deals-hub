"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralCapture() {
  const params = useSearchParams();
  const ref = params.get("ref");

  useEffect(() => {
    if (!ref) return;
    const code = ref.trim().toUpperCase();
    if (!code) return;
    localStorage.setItem("dh_ref", code);
    document.cookie = `dh_ref=${code};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
    fetch("/api/referrals/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, path: window.location.pathname }),
    }).catch(() => {});
  }, [ref]);

  return null;
}
