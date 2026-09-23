export default function BookLoading() {
  return (
    <div className="w-full min-h-screen bg-paper" aria-busy="true" aria-label="Loading booking flow...">
      {/* ---------------- Header Skeleton ---------------- */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full skeleton-shimmer shrink-0 ring-2 ring-emerald-soft" />
            <div className="space-y-1">
              <div className="h-4 w-28 rounded skeleton-shimmer" />
              <div className="h-3 w-36 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="h-4 w-32 rounded skeleton-shimmer" />
        </div>
      </header>

      {/* ---------------- Main Wizard Skeleton ---------------- */}
      <main className="mx-auto max-w-xl px-4 pb-28 pt-6">
        {/* Stepper Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 rounded skeleton-shimmer" />
            <div className="h-3.5 w-12 rounded skeleton-shimmer" />
          </div>
          <div className="mt-2.5 flex gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-emerald" />
            <div className="h-1.5 flex-1 rounded-full bg-line" />
            <div className="h-1.5 flex-1 rounded-full bg-line" />
            <div className="h-1.5 flex-1 rounded-full bg-line" />
            <div className="h-1.5 flex-1 rounded-full bg-line" />
            <div className="h-1.5 flex-1 rounded-full bg-line" />
            <div className="h-1.5 flex-1 rounded-full bg-line" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 rounded-full skeleton-shimmer" />
          <div className="h-4 w-24 rounded skeleton-shimmer" />
        </div>

        {/* Headings */}
        <div className="mt-4 space-y-2">
          <div className="h-8 w-64 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-full rounded skeleton-shimmer" />
        </div>

        {/* Plan Cards Skeleton */}
        <div className="mt-6 space-y-4">
          {/* Plan A Card Skeleton */}
          <div className="rounded-2xl border-2 border-line bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full skeleton-shimmer shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded-full skeleton-shimmer" />
                  <div className="h-6 w-20 rounded-md skeleton-shimmer mt-1" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-7 w-20 rounded-md skeleton-shimmer ml-auto" />
                <div className="h-3 w-28 rounded skeleton-shimmer ml-auto" />
              </div>
            </div>

            <div className="my-3.5 h-[1px] w-full bg-line" />

            <div className="space-y-2">
              <div className="h-3.5 w-11/12 rounded skeleton-shimmer" />
              <div className="h-3.5 w-10/12 rounded skeleton-shimmer" />
              <div className="h-3.5 w-9/12 rounded skeleton-shimmer" />
              <div className="h-3.5 w-7/12 rounded skeleton-shimmer" />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-2.5">
              <div className="h-3 w-24 rounded skeleton-shimmer" />
              <div className="h-3.5 w-36 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Plan B Card Skeleton */}
          <div className="relative rounded-2xl border-2 border-line bg-white p-5">
            <div className="absolute -top-3 right-5 h-5 w-40 rounded-full skeleton-shimmer" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full skeleton-shimmer shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded-full skeleton-shimmer" />
                  <div className="h-6 w-20 rounded-md skeleton-shimmer mt-1" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-7 w-20 rounded-md skeleton-shimmer ml-auto" />
                <div className="h-3 w-28 rounded skeleton-shimmer ml-auto" />
              </div>
            </div>

            <div className="my-3.5 h-[1px] w-full bg-line" />

            <div className="space-y-2">
              <div className="h-3.5 w-11/12 rounded skeleton-shimmer" />
              <div className="h-3.5 w-10/12 rounded skeleton-shimmer" />
              <div className="h-3.5 w-9/12 rounded skeleton-shimmer" />
              <div className="h-3.5 w-7/12 rounded skeleton-shimmer" />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-2.5">
              <div className="h-3 w-24 rounded skeleton-shimmer" />
              <div className="h-3.5 w-36 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>

        {/* Info Strip Skeleton */}
        <div className="mt-4 rounded-xl border border-line bg-cream/50 p-3.5 flex items-center justify-between">
          <div className="h-4 w-56 rounded skeleton-shimmer" />
          <div className="h-4 w-40 rounded skeleton-shimmer" />
        </div>
      </main>

      {/* ---------------- Bottom Sticky Nav Skeleton ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center px-4 py-3">
          <div className="h-12 w-full rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
