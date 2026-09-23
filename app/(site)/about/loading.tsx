export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 animate-fade-in" aria-busy="true">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left Column Skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-20 rounded-full skeleton-shimmer" />
          <div className="h-10 w-64 rounded-xl skeleton-shimmer mt-2" />
          <div className="h-4 w-72 rounded skeleton-shimmer" />

          <div className="space-y-2 pt-4">
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-11/12 rounded skeleton-shimmer" />
            <div className="h-4 w-4/5 rounded skeleton-shimmer" />
          </div>

          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-10/12 rounded skeleton-shimmer" />
          </div>

          <div className="flex gap-3 pt-4">
            <div className="h-12 w-44 rounded-xl skeleton-shimmer" />
            <div className="h-12 w-40 rounded-xl skeleton-shimmer" />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-5">
          <div className="card flex flex-col sm:flex-row items-center gap-5 p-6 shadow-sm">
            <div className="h-28 w-28 rounded-full skeleton-shimmer shrink-0" />
            <div className="space-y-2 w-full">
              <div className="h-5 w-40 rounded skeleton-shimmer" />
              <div className="h-4 w-56 rounded skeleton-shimmer" />
              <div className="h-4 w-32 rounded-full skeleton-shimmer mt-2" />
            </div>
          </div>

          <div className="card p-6 space-y-3">
            <div className="h-5 w-48 rounded skeleton-shimmer" />
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
