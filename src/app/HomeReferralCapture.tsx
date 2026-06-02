"use client";

import { Suspense } from "react";
import { ReferralCapture } from "@/components/ReferralCapture";

export function HomeReferralCapture() {
  return (
    <Suspense fallback={null}>
      <ReferralCapture />
    </Suspense>
  );
}
