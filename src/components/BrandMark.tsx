/** Logo DealsHub — 🔥 sobre degradado (como el diseño original). */
export function BrandMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const fontSize = Math.round(size * 0.5);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 ${className}`}
      style={{ width: size, height: size, fontSize }}
      aria-hidden
    >
      🔥
    </span>
  );
}
