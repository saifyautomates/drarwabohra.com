import type { Metadata } from "next";
import Link from "next/link";
import { getTreatments } from "@/lib/data";
import SectionHeading from "@/components/site/SectionHeading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Treatments — Dr. Arwa Bohra | Skin, Hair & Homeopathy",
  description:
    "Skin, hair and lifestyle concerns treated by Dr. Arwa Bohra, Homeopathic Consultant. Book an online consultation for your concern.",
};

export default function TreatmentsPage() {
  const treatments = getTreatments();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Treatments"
        title="What we treat"
        subline="Every consultation begins with a detailed discussion of your concern, your routine and your health history — treatment is planned around you."
      />

      <div className="mt-12 space-y-5">
        {treatments.map((t, i) => (
          <section
            key={t.id}
            id={t.slug}
            aria-labelledby={`${t.slug}-title`}
            className="card scroll-mt-24 p-6 sm:p-8"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-dark">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2
                  id={`${t.slug}-title`}
                  className="mt-2 font-display text-2xl text-ink"
                >
                  {t.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-smoke">
                  {t.desc}
                </p>
              </div>
              <Link
                href={`/book?reason=${t.slug}`}
                className="btn-primary shrink-0 sm:mt-8"
              >
                Book for this concern
              </Link>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-smoke">
        Treatment list editable by clinic in admin.
      </p>
    </div>
  );
}
