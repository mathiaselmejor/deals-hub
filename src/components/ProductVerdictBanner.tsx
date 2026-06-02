import Link from "next/link";
import { AffiliateLink } from "@/components/AffiliateLink";
import { computeDealScore, getDealScoreLabel } from "@/lib/algorithms";
import {
  buildAffiliateUrl,
  formatPrice,
  getBestOffer,
  getCategoryLabel,
  getSavings,
} from "@/lib/products";
import type { Product } from "@/lib/types";

/** Banner estilo Wirecutter — veredicto editorial rápido */
export function ProductVerdictBanner({ product }: { product: Product }) {
  const score = computeDealScore(product);
  const meta = getDealScoreLabel(score);
  const best = getBestOffer(product);
  const savings = getSavings(product);
  const directCount = product.offers.filter((o) => o.linkKind === "direct").length;

  let verdict = "Precio razonable en el mercado actual.";
  let tone: "emerald" | "indigo" | "amber" | "slate" = "slate";

  if (score >= 85) {
    verdict = "Chollo destacado: descuento, valoración y ahorro por encima de la media.";
    tone = "emerald";
  } else if (score >= 70) {
    verdict = "Muy buena compra si buscas equilibrio entre precio y calidad.";
    tone = "indigo";
  } else if (score >= 55) {
    verdict = "Buen momento para comprar si lo necesitas ya.";
    tone = "amber";
  }

  const toneClasses = {
    emerald: "border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-card",
    indigo: "border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-card",
    amber: "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-card",
    slate: "border-white/10 bg-card",
  };

  return (
    <div className={`verdict-banner rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Veredicto DealsHub
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>
              Deal Score{" "}
              <strong className={meta.color}>{score}/100</strong> · {meta.label}
            </span>
            {savings > 0 && (
              <span>
                Ahorro <strong className="text-rose-400">{formatPrice(savings)}</strong>
              </span>
            )}
            <span>{directCount} fichas directas</span>
            <span>{getCategoryLabel(product.category)}</span>
          </div>
        </div>

        {best && (
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <AffiliateLink
              href={buildAffiliateUrl(best, product.id)}
              productId={product.id}
              store={best.store}
              className="btn-primary px-6 py-3 text-sm text-center"
            >
              Comprar al mejor precio →
            </AffiliateLink>
            <Link href="/comparar" className="text-center text-xs text-indigo-400 hover:underline">
              Comparar con otro producto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
