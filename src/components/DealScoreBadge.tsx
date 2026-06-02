import { computeDealScore, getDealScoreLabel } from "@/lib/algorithms";

export function DealScoreBadge({ score }: { score: number }) {
  const { label, color } = getDealScoreLabel(score);
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
      <span className="text-lg font-bold text-indigo-400">{score}</span>
      <div className="text-left">
        <p className={`text-xs font-semibold ${color}`}>{label}</p>
        <p className="text-[10px] text-slate-500">Score DealsHub</p>
      </div>
    </div>
  );
}

export function DealScoreBadgeForProduct({ product }: { product: Parameters<typeof computeDealScore>[0] }) {
  return <DealScoreBadge score={computeDealScore(product)} />;
}
