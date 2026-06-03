"use client";

import { ProductImage } from "@/components/ProductImage";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/products";

type CatalogOption = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  image: string;
  price: number;
};

export function ProductComparePicker({
  options,
  initialA,
  initialB,
}: {
  options: CatalogOption[];
  initialA?: string;
  initialB?: string;
}) {
  const router = useRouter();
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [selectedA, setSelectedA] = useState(initialA ?? "");
  const [selectedB, setSelectedB] = useState(initialB ?? "");

  const filterOptions = (query: string, excludeId?: string) => {
    const q = query.toLowerCase().trim();
    return options
      .filter((o) => o.id !== excludeId)
      .filter((o) => {
        if (!q) return true;
        return (
          o.name.toLowerCase().includes(q) ||
          o.categoryLabel.toLowerCase().includes(q) ||
          o.id.includes(q)
        );
      })
      .slice(0, 8);
  };

  const listA = useMemo(() => filterOptions(queryA, selectedB), [queryA, selectedB, options]);
  const listB = useMemo(() => filterOptions(queryB, selectedA), [queryB, selectedA, options]);

  const productA = options.find((o) => o.id === selectedA);
  const productB = options.find((o) => o.id === selectedB);

  function goCompare(a: string, b: string) {
    if (!a || !b || a === b) return;
    router.push(`/comparar?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <CompareSlot
          label="Producto A"
          query={queryA}
          onQueryChange={setQueryA}
          selected={productA}
          options={listA}
          onSelect={(id) => {
            setSelectedA(id);
            setQueryA("");
            if (selectedB) goCompare(id, selectedB);
          }}
        />
        <CompareSlot
          label="Producto B"
          query={queryB}
          onQueryChange={setQueryB}
          selected={productB}
          options={listB}
          onSelect={(id) => {
            setSelectedB(id);
            setQueryB("");
            if (selectedA) goCompare(selectedA, id);
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={!selectedA || !selectedB || selectedA === selectedB}
          onClick={() => goCompare(selectedA, selectedB)}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold shadow-lg shadow-indigo-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ⚔️ Iniciar duelo
        </button>
        {selectedA && selectedB && selectedA === selectedB && (
          <p className="text-sm text-rose-400">Elige dos productos distintos</p>
        )}
      </div>
    </div>
  );
}

function CompareSlot({
  label,
  query,
  onQueryChange,
  selected,
  options,
  onSelect,
}: {
  label: string;
  query: string;
  onQueryChange: (v: string) => void;
  selected?: CatalogOption;
  options: CatalogOption[];
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      {selected ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <ProductImage src={selected.image} alt={selected.name} fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{selected.name}</p>
            {selected.price > 0 && (
              <p className="text-xs text-emerald-400">{formatPrice(selected.price)}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Busca un producto del catálogo</p>
      )}
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Ej: iPhone, air fryer, Sony..."
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-indigo-500/50 focus:ring-2"
      />
      {query && options.length > 0 && (
        <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/80">
          {options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onSelect(o.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                  <ProductImage src={o.image} alt={o.name} fill sizes="40px" className="object-cover" />
                </div>
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="shrink-0 text-[10px] text-slate-500">{o.categoryLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
