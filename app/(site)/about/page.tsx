import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSettings, getTreatments } from "@/lib/data";
import SectionHeading from "@/components/site/SectionHeading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About — Dr. Arwa Bohra | Homeopathic Consultant",
  description:
    "About Dr. Arwa Bohra, Homeopathic Consultant and Skin & Hair Expert with 439,000+ subscribers and worldwide online consultations.",
};

export default function AboutPage() {
  const settings = getSettings();
  const treatments = getTreatments();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="About"
            title={settings.doctorName}
            subline={settings.doctorTitle}
          />
          <p className="mt-6 text-[15px] leading-relaxed text-smoke">
            {settings.aboutShort}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-smoke">
            Consultations are unhurried and one-on-one. For skin and hair
            concerns, the discussion covers your routine, diet and lifestyle
            alongside the concern itself, so the plan fits your everyday life —
            not just the prescription.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn-primary !px-7 !py-3.5">
              Book Appointment
            </Link>
            <Link href="/treatments" className="btn-outline !px-6 !py-3.5">
              View treatments
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          {/* Doctor Profile Card */}
          <div className="card flex flex-col sm:flex-row items-center gap-5 p-6 shadow-sm">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-gold/60 p-0.5 shadow-md">
              <Image
                src="/images/dr-arwa-bohra.png"
                alt="Dr. Arwa Bohra"
                width={200}
                height={200}
                priority
                className="h-full w-full rounded-full object-cover object-top"
              />
            </div>
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs font-semibold text-emerald-dark">
                Verified Consultant
              </span>
              <p className="mt-1 font-display text-xl text-ink">{settings.doctorName}</p>
              <p className="text-xs font-medium text-emerald-dark">{settings.doctorTitle}</p>
              <p className="mt-1 text-xs text-smoke">Online E-Consultation · Available Worldwide</p>
            </div>
          </div>

          {/* YouTube & Instagram Media Cards */}
          <div className="card p-6 border-l-4 border-l-[#FF0000] bg-paper shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#FF0000]">Official YouTube Creator</p>
                <p className="mt-1 font-display text-xl text-ink">@DrArwaBohra</p>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-[#FF0000]">
                439K+ Subs
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-smoke">
              Over 795+ educational videos on homeopathic mother tinctures, hair regrowth protocols, and skincare routines with 39 Million+ views.
            </p>
            <a
              href="https://www.youtube.com/@DrArwaBohra"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FF0000] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#CC0000] hover:shadow-md transition-all active:scale-[0.98]"
            >
              <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Visit Channel on YouTube →
            </a>
          </div>

          <div className="card p-6 border-l-4 border-l-[#ee2a7b] bg-paper shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#ee2a7b]">Official Instagram</p>
                <p className="mt-1 font-display text-xl text-ink">@drarwabohra</p>
              </div>
              <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
                Verified
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-smoke">
              Daily homeopathy tips, real patient transformations, skincare routines, and healthy living updates.
            </p>
            <a
              href="https://www.instagram.com/drarwabohra/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow on Instagram →
            </a>
          </div>
          <div className="card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
              Practice focus
            </p>
            <ul className="mt-4 space-y-2.5 text-[15px] text-ink/85">
              {treatments.map((t) => (
                <li key={t.id} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {t.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
              E-Consultation Platform
            </p>
            <p className="mt-3 font-display text-lg text-ink">
              {settings.doctorName}
            </p>
            <p className="mt-1 text-sm text-smoke">{settings.address}</p>
            <p className="mt-3 text-sm">
              <a
                href={`tel:+91${settings.phone}`}
                className="font-medium text-emerald-dark underline-offset-2 hover:underline"
              >
                +91 {settings.phone}
              </a>
            </p>
            <p className="mt-4 text-xs leading-relaxed text-smoke">
              Expert Homeopathic Care from the comfort of your home.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
