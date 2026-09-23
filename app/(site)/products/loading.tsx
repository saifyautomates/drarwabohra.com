export default function ProductsLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10 sm:py-16 animate-fade-in"
      aria-busy="true"
    >
      {/* Header Skeleton */}
      <div className="text-center flex flex-col items-center space-y-2 mb-10">
        <div className="h-4 w-32 rounded-full skeleton-shimmer" />
        <div className="h-10 w-72 rounded-xl skeleton-shimmer mt-2" />
        <div className="h-4 w-96 max-w-full rounded skeleton-shimmer mt-1" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-32 rounded-full skeleton-shimmer" />
          <div className="h-6 w-32 rounded-full skeleton-shimmer" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-14 w-full rounded-2xl border border-line bg-white p-3 mb-10 flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-20 rounded-full skeleton-shimmer" />
          ))}
        </div>
        <div className="h-8 w-48 rounded-xl skeleton-shimmer hidden md:block" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-line bg-white overflow-hidden shadow-xs"
          >
            <div className="aspect-square w-full skeleton-shimmer" />
            <div className="p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-12 rounded skeleton-shimmer" />
                <div className="h-3 w-20 rounded skeleton-shimmer" />
              </div>
              <div className="h-5 w-40 rounded skeleton-shimmer" />
              <div className="h-3 w-full rounded skeleton-shimmer" />
              <div className="h-3 w-3/4 rounded skeleton-shimmer" />
              <div className="pt-3 border-t border-line flex justify-between items-center">
                <div className="h-6 w-20 rounded skeleton-shimmer" />
                <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
