export default function AdminLoading() {
  return (
    <div className="space-y-7 animate-fade-in" aria-busy="true" aria-label="Loading admin dashboard...">
      {/* Top Header & Range Buttons Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-2">
          <div className="h-3 w-40 rounded skeleton-shimmer" />
          <div className="h-8 w-72 rounded-xl skeleton-shimmer" />
          <div className="h-3.5 w-96 max-w-full rounded skeleton-shimmer" />
        </div>
        <div className="h-10 w-72 rounded-2xl skeleton-shimmer" />
      </div>

      {/* 4 Financial Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 sm:p-6 space-y-3 bg-paper">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-28 rounded skeleton-shimmer" />
              <div className="h-8 w-8 rounded-xl skeleton-shimmer" />
            </div>
            <div className="h-9 w-32 rounded-lg skeleton-shimmer" />
            <div className="h-3.5 w-full rounded skeleton-shimmer pt-2 border-t border-line/60" />
          </div>
        ))}
      </div>

      {/* Revenue Chart Skeleton */}
      <div className="card p-6 shadow-sm bg-paper border border-line space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-5 w-48 rounded skeleton-shimmer" />
            <div className="h-3.5 w-64 rounded skeleton-shimmer" />
          </div>
          <div className="h-8 w-44 rounded-xl skeleton-shimmer" />
        </div>
        <div className="h-56 w-full rounded-xl skeleton-shimmer mt-4" />
      </div>

      {/* Product Sales Skeleton */}
      <div className="card p-6 shadow-sm bg-paper border border-line space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-5 w-52 rounded skeleton-shimmer" />
            <div className="h-3.5 w-72 rounded skeleton-shimmer" />
          </div>
          <div className="h-8 w-32 rounded-xl skeleton-shimmer" />
        </div>
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl border border-line/60 p-3 skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
