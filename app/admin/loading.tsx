export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-fade-in" aria-busy="true" aria-label="Loading admin dashboard...">
      {/* Top Banner Skeleton */}
      <div className="h-44 w-full rounded-2xl border border-line bg-cream/60 p-6 sm:p-8 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-5 w-48 rounded-full skeleton-shimmer" />
          <div className="h-9 w-80 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-96 max-w-full rounded skeleton-shimmer" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-36 rounded-xl skeleton-shimmer" />
          <div className="h-10 w-44 rounded-xl skeleton-shimmer" />
        </div>
      </div>

      {/* 4 Financial Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 sm:p-6 border-l-4 border-l-line space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-28 rounded skeleton-shimmer" />
              <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
            </div>
            <div className="h-9 w-32 rounded-lg skeleton-shimmer" />
            <div className="h-3.5 w-full rounded skeleton-shimmer pt-2 border-t border-line/60" />
          </div>
        ))}
      </div>

      {/* Plan Performance Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-5 w-48 rounded skeleton-shimmer" />
              <div className="h-3.5 w-64 rounded skeleton-shimmer" />
            </div>
            <div className="h-6 w-24 rounded-full skeleton-shimmer" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="h-44 rounded-xl border border-line p-4 skeleton-shimmer" />
            <div className="h-44 rounded-xl border border-line p-4 skeleton-shimmer" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="h-5 w-40 rounded skeleton-shimmer" />
          <div className="h-3.5 w-56 rounded skeleton-shimmer" />
          <div className="space-y-2 mt-4">
            <div className="h-14 rounded-xl skeleton-shimmer" />
            <div className="h-14 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Today's Consultations Skeleton */}
      <div className="card p-6 space-y-4">
        <div className="h-6 w-64 rounded skeleton-shimmer" />
        <div className="h-3.5 w-80 rounded skeleton-shimmer" />
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-line p-3 flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
                <div className="space-y-1">
                  <div className="h-4 w-36 rounded skeleton-shimmer" />
                  <div className="h-3 w-48 rounded skeleton-shimmer" />
                </div>
              </div>
              <div className="h-8 w-24 rounded-lg skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
