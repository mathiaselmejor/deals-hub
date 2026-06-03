import { ProductImage } from "@/components/ProductImage";
import { getAmazonAsinFromOffers } from "@/lib/product-images";
import Link from "next/link";
import { getDealScoreLabel } from "@/lib/algorithms";
import type { ProductCompareResult, CompareRow } from "@/lib/compare";
import { formatPrice, getLowestPrice } from "@/lib/products";

function WinnerBadge({ winner }: { winner: "a" | "b" | "tie" | null }) {
  if (winner === "a") {
    return (
      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
        Gana A
      </span>
    );
  }
  if (winner === "b") {
    return (
      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-400">
        Gana B
      </span>
    );
  }
  if (winner === "tie") {
    return (
      <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
        Empate
      </span>
    );
  }
  return null;
}

function CompareBar({ row, side }: { row: CompareRow; side: "a" | "b" }) {
  const pct = side === "a" ? row.barA : row.barB;
  const isWinner = row.winner === side;
  if (pct == null) return null;

  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-all ${
          isWinner ? "bg-gradient-to-r from-emerald-500 to-indigo-500" : "bg-slate-600"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ProductColumn({
  product,
  score,
  wins,
  slot,
  isOverallWinner,
}: {
  product: ProductCompareResult["productA"];
  score: number;
  wins: number;
  slot: "a" | "b";
  isOverallWinner: boolean;
}) {
  const price = getLowestPrice(product) || product.price;
  const scoreMeta = getDealScoreLabel(score);

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isOverallWinner
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
          : "border-white/10 bg-card"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Producto {slot.toUpperCase()}
      </p>
      <div className="relative mt-3 aspect-square overflow-hidden rounded-xl border border-white/10">
        <ProductImage src={product.image} alt={product.name} asin={getAmazonAsinFromOffers(product.offers)} fill sizes="200px" className="object-cover" />
      </div>
      <h2 className="mt-4 text-lg font-bold leading-snug">{product.name}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`text-2xl font-bold ${scoreMeta.color}`}>{score}</span>
        <span className="text-xs text-slate-500">Deal Score</span>
        {isOverallWinner && (
          <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-400">
            🏆 Recomendado
          </span>
        )}
      </div>
      {price > 0 && (
        <p className="mt-2 text-sm text-emerald-400">
          Desde <span className="font-bold">{formatPrice(price)}</span>
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500">{wins} categorías ganadas</p>
      <Link
        href={`/producto/${product.id}`}
        className="mt-4 inline-block text-sm font-medium text-indigo-400 hover:underline"
      >
        Ver ficha →
      </Link>
    </div>
  );
}

export function ProductCompareDuel({ result }: { result: ProductCompareResult }) {
  const { productA, productB, scoreA, scoreB, winsA, winsB, overallWinner, rows } = result;
  const winnerName =
    overallWinner === "a"
      ? productA.name
      : overallWinner === "b"
        ? productB.name
        : null;

  return (
    <div className="space-y-8">
      {winnerName && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-6 py-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Resultado del duelo
          </p>
          <p className="mt-2 text-xl font-bold sm:text-2xl">
            {winnerName} <span className="text-indigo-400">gana en más criterios</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Inspirado en comparadores como{" "}
            <a
              href="https://versus.com/es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              Versus
            </a>
            , pero con precios reales en tiendas españolas.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ProductColumn
          product={productA}
          score={scoreA}
          wins={winsA}
          slot="a"
          isOverallWinner={overallWinner === "a"}
        />
        <ProductColumn
          product={productB}
          score={scoreB}
          wins={winsB}
          slot="b"
          isOverallWinner={overallWinner === "b"}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-card">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold">Comparativa detallada</h3>
          <p className="mt-1 text-sm text-slate-500">
            Fila a fila, como en Versus: quién gana en precio, valoración y especificaciones.
          </p>
        </div>
        <div className="divide-y divide-white/5">
          {rows.map((row) => (
            <div key={row.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
              <div className="text-right lg:order-1">
                <p className="text-sm font-semibold">{row.valueA}</p>
                <CompareBar row={row} side="a" />
              </div>

              <div className="text-center lg:order-2 lg:min-w-[180px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {row.label}
                </p>
                <div className="mt-1 flex justify-center">
                  <WinnerBadge winner={row.winner} />
                </div>
                {row.hint && (
                  <p className="mt-1 text-[10px] text-slate-600">{row.hint}</p>
                )}
              </div>

              <div className="lg:order-3">
                <p className="text-sm font-semibold">{row.valueB}</p>
                <CompareBar row={row} side="b" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={`/comparar?a=${productA.id}&b=${productB.id}`}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5"
        >
          Copiar enlace del duelo
        </Link>
        <Link
          href={`/comparar?a=${productB.id}&b=${productA.id}`}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5"
        >
          Invertir orden
        </Link>
      </div>
    </div>
  );
}
