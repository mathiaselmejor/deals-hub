export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="skeleton-shimmer h-12 w-full max-w-2xl rounded-2xl" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton-shimmer aspect-[4/3] rounded-2xl" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded" />
            <div className="skeleton-shimmer h-6 w-1/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
