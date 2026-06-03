"use client";

import { getAffiliateConfig } from "@/lib/products";
import type { StoreId } from "@/lib/types";

type Props = {
  availableStores: StoreId[];
  selectedStores: StoreId[];
  onStoresChange: (stores: StoreId[]) => void;
  minDiscount: number;
  onMinDiscountChange: (value: number) => void;
  directOnly: boolean;
  onDirectOnlyChange: (value: boolean) => void;
};

const discountChips = [
  { value: 0, label: "Todos" },
  { value: 10, label: "−10%" },
  { value: 20, label: "−20%" },
  { value: 30, label: "−30%+" },
];

export function SearchFilters({
  availableStores,
  selectedStores,
  onStoresChange,
  minDiscount,
  onMinDiscountChange,
  directOnly,
  onDirectOnlyChange,
}: Props) {
  const config = getAffiliateConfig();

  const toggleStore = (store: StoreId) => {
    if (selectedStores.length === 0) {
      onStoresChange([store]);
      return;
    }
    if (selectedStores.includes(store)) {
      const next = selectedStores.filter((s) => s !== store);
      onStoresChange(next);
    } else {
      onStoresChange([...selectedStores, store]);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/80 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tienda</span>
        {availableStores.map((store) => {
          const highlighted =
            selectedStores.length === 0 || selectedStores.includes(store);
          const info = config.stores[store];
          return (
            <button
              key={store}
              type="button"
              onClick={() => toggleStore(store)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                highlighted
                  ? "ring-1 ring-white/25"
                  : "opacity-35 grayscale"
              }`}
              style={{
                backgroundColor: `${info?.color ?? "#6366f1"}22`,
                color: info?.color ?? "#a5b4fc",
              }}
            >
              {info?.label ?? store}
            </button>
          );
        })}
        {selectedStores.length > 0 && (
          <button
            type="button"
            onClick={() => onStoresChange([])}
            className="text-xs text-slate-500 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Descuento</span>
        {discountChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => onMinDiscountChange(chip.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              minDiscount === chip.value
                ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={directOnly}
          onChange={(e) => onDirectOnlyChange(e.target.checked)}
          className="rounded border-white/20 bg-card accent-indigo-500"
        />
        Solo enlaces directos
      </label>
    </div>
  );
}
