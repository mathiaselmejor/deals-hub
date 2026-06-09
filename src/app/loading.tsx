export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-12">
      <div className="skeleton-shimmer h-10 w-64 rounded-xl" />
      <div className="mt-4 skeleton-shimmer h-5 w-96 max-w-full rounded-lg" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
