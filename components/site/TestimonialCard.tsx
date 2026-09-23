import type { Testimonial } from "@/lib/data";

/**
 * Patient testimonial card. Testimonials seeded with sample:true carry a
 * visible "Sample" badge — never presented as real patient reviews.
 */
export default function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-2">
        <span
          aria-hidden="true"
          className="font-display text-4xl leading-none text-gold"
        >
          &ldquo;
        </span>
        {t.sample && (
          <span className="badge badge-sample">Sample</span>
        )}
      </div>
      <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/85">
        {t.text}
      </blockquote>
      <figcaption className="mt-5 border-t border-line pt-4">
        <p className="text-sm font-semibold text-ink">{t.name}</p>
        <p className="mt-0.5 text-xs text-smoke">{t.treatment}</p>
      </figcaption>
    </figure>
  );
}
