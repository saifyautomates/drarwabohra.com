export default function TreatmentsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 animate-fade-in" aria-busy="true">
      {/* Heading Skeleton */}
      <div className="text-center flex flex-col items-center space-y-2">
        <div className="h-4 w-28 rounded-full skeleton-shimmer" />
        <div className="h-9 w-60 rounded-xl skeleton-shimmer mt-2" />
        <div className="h-4 w-96 max-w-full rounded skeleton-shimmer mt-1" />
      </div>

      {/* Treatment Cards Skeleton */}
      <div className="mt-12 space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl space-y-2.5 w-full">
                <div className="h-3 w-8 rounded skeleton-shimmer" />
                <div className="h-7 w-48 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-4/5 rounded skeleton-shimmer" />
              </div>
              <div className="h-11 w-44 rounded-xl skeleton-shimmer shrink-0 sm:mt-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
