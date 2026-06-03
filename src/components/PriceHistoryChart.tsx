"use client";

import { formatPrice } from "@/lib/catalog-formatters";
import type { PriceHistoryPoint } from "@/lib/price-history";

export function PriceHistoryChart({
  series,
  currentPrice,
}: {
  series: PriceHistoryPoint[];
  currentPrice: number;
}) {
  if (series.length < 2) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card p-5">
        <h2 className="text-lg font-bold">Historial de precio</h2>
        <p className="mt-2 text-sm text-slate-500">
          Aún no hay suficientes datos. Vuelve en unos días — registramos precios verificados
          automáticamente.
        </p>
      </div>
    );
  }

  const prices = series.map((p) => p.price);
  const min = Math.min(...prices, currentPrice);
  const max = Math.max(...prices, currentPrice);
  const range = max - min || 1;
  const first = series[0].price;
  const changePct = first > 0 ? Math.round(((currentPrice - first) / first) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">Historial de precio</h2>
        <span
          className={`text-sm font-semibold ${changePct <= 0 ? "text-emerald-400" : "text-rose-400"}`}
        >
          {changePct <= 0 ? "▼" : "▲"} {Math.abs(changePct)}% vs hace {series.length} días
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Precios verificados en Amazon · {series.length} registros
      </p>
      <div className="mt-4 flex h-24 items-end gap-0.5">
        {series.slice(-30).map((pt) => {
          const h = Math.max(8, ((pt.price - min) / range) * 100);
          const isLast = pt === series[series.length - 1];
          return (
            <div
              key={pt.date}
              title={`${pt.date}: ${formatPrice(pt.price)}`}
              className={`flex-1 rounded-t transition ${isLast ? "bg-emerald-500" : "bg-indigo-500/50"}`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>Mín: {formatPrice(min)}</span>
        <span>Actual: {formatPrice(currentPrice)}</span>
        <span>Máx: {formatPrice(max)}</span>
      </div>
    </div>
  );
}
