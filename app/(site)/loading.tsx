export default function SiteLoading() {
  return (
    <div className="w-full animate-fade-in" aria-busy="true" aria-label="Loading page content...">
      {/* ---------------- HERO SKELETON ---------------- */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-cream/40 via-paper to-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            {/* Tagline pill */}
            <div className="h-5 w-40 rounded-full skeleton-shimmer" />

            {/* Headline */}
            <div className="mt-5 space-y-3">
              <div className="h-11 w-11/12 rounded-xl skeleton-shimmer" />
              <div className="h-11 w-3/4 rounded-xl skeleton-shimmer" />
            </div>

            {/* Subline */}
            <div className="mt-5 space-y-2">
              <div className="h-4 w-full rounded-md skeleton-shimmer" />
              <div className="h-4 w-5/6 rounded-md skeleton-shimmer" />
              <div className="h-4 w-4/6 rounded-md skeleton-shimmer" />
            </div>

            {/* Doctor info */}
            <div className="mt-6 space-y-1.5">
              <div className="h-5 w-44 rounded-md skeleton-shimmer" />
              <div className="h-4 w-60 rounded-md skeleton-shimmer" />
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="h-13 w-48 rounded-xl skeleton-shimmer" />
              <div className="h-13 w-40 rounded-xl skeleton-shimmer" />
            </div>

            {/* Checkpoints */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full skeleton-shimmer shrink-0" />
                <div className="h-4 w-80 rounded-md skeleton-shimmer" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full skeleton-shimmer shrink-0" />
                <div className="h-4 w-96 rounded-md skeleton-shimmer" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full skeleton-shimmer shrink-0" />
                <div className="h-4 w-72 rounded-md skeleton-shimmer" />
              </div>
            </div>

            {/* Next available badge */}
            <div className="mt-7 h-8 w-64 rounded-full skeleton-shimmer" />
          </div>

          {/* Right Column: Doctor Portrait Card Skeleton */}
          <div className="card relative mx-auto w-full max-w-md p-6 text-center shadow-md sm:p-8">
            {/* Circle Photo */}
            <div className="mx-auto h-52 w-52 sm:h-60 sm:w-60 rounded-full skeleton-shimmer ring-4 ring-paper" />

            {/* Doctor Name & Details */}
            <div className="mt-6 space-y-2 flex flex-col items-center">
              <div className="h-7 w-44 rounded-md skeleton-shimmer" />
              <div className="h-1 w-10 rounded skeleton-shimmer my-1" />
              <div className="h-4 w-60 rounded-md skeleton-shimmer" />
              <div className="h-3.5 w-72 rounded-md skeleton-shimmer" />
            </div>

            {/* Social badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <div className="h-7 w-32 rounded-full skeleton-shimmer" />
              <div className="h-7 w-28 rounded-full skeleton-shimmer" />
              <div className="h-7 w-28 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CONSULTATION PLANS SKELETON ---------------- */}
      <section className="border-t border-line bg-cream/30 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Section heading */}
          <div className="text-center flex flex-col items-center space-y-2">
            <div className="h-4 w-36 rounded-full skeleton-shimmer" />
            <div className="h-8 w-72 rounded-xl skeleton-shimmer mt-2" />
            <div className="h-4 w-96 max-w-full rounded-md skeleton-shimmer mt-1" />
          </div>

          {/* 2 Plan Cards */}
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Plan A Skeleton */}
            <div className="card p-7 sm:p-9 border-2 border-line">
              <div className="flex justify-between items-center">
                <div className="h-6 w-36 rounded-full skeleton-shimmer" />
                <div className="h-4 w-20 rounded skeleton-shimmer" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="h-10 w-28 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-36 rounded skeleton-shimmer" />
              </div>
              <div className="mt-4 h-4 w-5/6 rounded skeleton-shimmer" />
              <div className="my-6 h-[1px] w-full bg-line" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-11/12 rounded skeleton-shimmer" />
                <div className="h-4 w-4/5 rounded skeleton-shimmer" />
                <div className="h-4 w-3/5 rounded skeleton-shimmer" />
              </div>
              <div className="mt-8 pt-6 border-t border-line">
                <div className="h-12 w-full rounded-xl skeleton-shimmer" />
              </div>
            </div>

            {/* Plan B Skeleton */}
            <div className="card p-7 sm:p-9 border-2 border-gold/40 relative">
              <div className="absolute -top-3.5 right-6 h-6 w-48 rounded-full skeleton-shimmer" />
              <div className="flex justify-between items-center">
                <div className="h-6 w-36 rounded-full skeleton-shimmer" />
                <div className="h-4 w-24 rounded skeleton-shimmer" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="h-10 w-28 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-36 rounded skeleton-shimmer" />
              </div>
              <div className="mt-4 h-4 w-5/6 rounded skeleton-shimmer" />
              <div className="my-6 h-[1px] w-full bg-line" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-11/12 rounded skeleton-shimmer" />
                <div className="h-4 w-4/5 rounded skeleton-shimmer" />
                <div className="h-4 w-3/5 rounded skeleton-shimmer" />
              </div>
              <div className="mt-8 pt-6 border-t border-line">
                <div className="h-12 w-full rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
