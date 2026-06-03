"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

type Props = {
  deals: Product[];
};

export function DealRadar({ deals }: Props) {
  const top = deals.filter((p) => p.discount >= 15).slice(0, 6);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (top.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % top.length), 4500);
    return () => clearInterval(t);
  }, [top.length]);

  if (top.length === 0) return null;

  const current = top[index];

  return (
    <section className="border-b border-white/5 bg-gradient-to-r from-rose-500/[0.06] via-transparent to-indigo-500/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-lg animate-pulse">
            📡
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-300">Radar de chollos</p>
            <p className="text-sm text-slate-400">Rotación automática · mejor descuento ahora</p>
          </div>
        </div>

        <Link
          href={`/producto/${current.id}`}
          className="group flex min-w-0 flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-card/80 px-4 py-3 transition hover:border-rose-500/40 sm:max-w-2xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover transition group-hover:scale-105"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold group-hover:text-rose-200">{current.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-emerald-400">{formatPrice(current.price)}</span>
              <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                −{current.discount}%
              </span>
            </div>
          </div>
          <span className="hidden shrink-0 text-sm text-indigo-300 sm:inline">Ver →</span>
        </Link>

        <div className="flex gap-1.5">
          {top.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Chollo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-rose-400" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
