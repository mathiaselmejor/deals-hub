"use client";

import { Suspense } from "react";
import { ReferralCapture } from "@/components/ReferralCapture";

export function GlobalReferralCapture() {
  return (
    <Suspense fallback={null}>
      <ReferralCapture />
    </Suspense>
  );
}
