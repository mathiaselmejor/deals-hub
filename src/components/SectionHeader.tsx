import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todo →",
  accent = "indigo",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  accent?: "indigo" | "rose" | "emerald" | "amber";
}) {
  const accents = {
    indigo: "text-indigo-300 border-indigo-500/20 bg-indigo-500/5",
    rose: "text-rose-300 border-rose-500/20 bg-rose-500/5",
    emerald: "text-emerald-300 border-emerald-500/20 bg-emerald-500/5",
    amber: "text-amber-300 border-amber-500/20 bg-amber-500/5",
  };

  return (
    <div className={`section-header rounded-2xl border px-6 py-5 ${accents[accent]}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{eyebrow}</p>
          )}
          <h2 className="mt-1 text-2xl font-bold text-white">{title}</h2>
          {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-sm font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
