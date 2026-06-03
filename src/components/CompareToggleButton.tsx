"use client";

import { useEffect, useState } from "react";
import {
  COMPARE_QUEUE_EVENT,
  isInCompareQueue,
  toggleCompareQueue,
} from "@/lib/compare-queue";

export function CompareToggleButton({
  productId,
  name,
  image,
}: {
  productId: string;
  name: string;
  image: string;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(isInCompareQueue(productId));
    sync();
    window.addEventListener(COMPARE_QUEUE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_QUEUE_EVENT, sync);
  }, [productId]);

  return (
    <button
      type="button"
      title={active ? "Quitar de comparar" : "Añadir a comparar"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompareQueue({ id: productId, name, image });
      }}
      className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
        active
          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
          : "bg-white/5 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-indigo-500/20 hover:text-indigo-300"
      }`}
    >
      {active ? "✓ En cola" : "⚔️ +"}
    </button>
  );
}
