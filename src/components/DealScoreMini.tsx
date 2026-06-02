import { computeDealScore, getDealScoreLabel } from "@/lib/algorithms";

export function DealScoreMini({ score, showLabel = false }: { score: number; showLabel?: boolean }) {
  const meta = getDealScoreLabel(score);
  const pct = score;

  return (
    <div className="deal-score-mini inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-2 py-1 backdrop-blur-sm">
      <div className="relative h-7 w-7">
        <svg viewBox="0 0 36 36" className="h-7 w-7 -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${pct * 0.88} 88`}
            className={meta.color}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${meta.color}`}>
          {score}
        </span>
      </div>
      {showLabel && <span className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>}
    </div>
  );
}

export function DealScoreMiniForProduct({ product }: { product: { id: string } & Parameters<typeof computeDealScore>[0] }) {
  const score = computeDealScore(product);
  return <DealScoreMini score={score} />;
}
