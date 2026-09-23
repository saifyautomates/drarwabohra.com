import Link from "next/link";
import {
  getBookings,
  getSchedule,
  getSettings,
  getTestimonials,
  getTreatments,
  getVideos,
} from "@/lib/data";
import { getNextAvailable, nowIST } from "@/lib/slots";
import {
  formatDateLabel,
  formatINR,
  formatTime12,
  waLink,
} from "@/lib/data-client";
import SectionHeading from "@/components/site/SectionHeading";
import TestimonialCard from "@/components/site/TestimonialCard";
import VideoCarousel from "@/components/site/VideoCarousel";
import FaqAccordion from "@/components/site/FaqAccordion";
import { buildFaqs } from "@/components/site/faq-data";

export const revalidate = 60;

import Image from "next/image";

/* ---------------------------------------------------------------- */
/* Small presentational pieces (server)                              */
/* ---------------------------------------------------------------- */

function DoctorPortrait() {
  return (
    <div className="card relative mx-auto w-full max-w-md overflow-hidden p-6 text-center shadow-md transition-all duration-300 hover:shadow-xl sm:p-8">
      {/* Decorative gradient background glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-soft/50 blur-2xl" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-gold/10 blur-2xl" 
      />

      {/* Doctor Photo (Circular Ultra HD) */}
      <div className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-dark via-gold to-emerald p-[4px] shadow-xl">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-paper ring-4 ring-paper">
            <Image
              src="/images/dr-arwa-bohra.png"
              alt="Dr. Arwa Bohra - Homeopathic Consultant, Skin & Hair Expert"
              width={600}
              height={600}
              priority
              className="h-full w-full rounded-full object-cover object-top transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
        {/* Floating verified badge */}
        <span 
          title="Verified Doctor" 
          className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-white shadow-lg ring-4 ring-paper z-10"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>

      {/* Info */}
      <div className="relative mt-6">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">Dr. Arwa Bohra</h2>
        <div className="rule-gold mx-auto my-3" aria-hidden="true" />
        <p className="text-sm font-medium text-emerald-dark">
          Homeopathic Consultant · Skin &amp; Hair Expert
        </p>
        <p className="mt-1 text-xs text-smoke">
          Online E-Consultation · Voice Call &amp; Remedies Worldwide
        </p>

        {/* Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-dark" />
            Verified Practitioner
          </span>
          <a
            href="https://www.youtube.com/@DrArwaBohra"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FF0000] px-3.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-[#CC0000] transition-all hover:scale-105"
          >
            <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            439K+ Subs
          </a>
          <a
            href="https://www.instagram.com/drarwabohra/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-3.5 py-1 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all hover:scale-105"
          >
            <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @drarwabohra
          </a>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            ★ Silver Creator
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-emerald-dark"
    >
      <path d="M2.5 8.5 6.5 12.5 13.5 4" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Homepage                                                          */
/* ---------------------------------------------------------------- */

export default function HomePage() {
  const settings = getSettings();
  const schedule = getSchedule();
  const treatments = getTreatments();
  const testimonials = getTestimonials();
  const videos = getVideos().filter((v) => v.active);
  const faqs = buildFaqs(settings).slice(0, 4);

  const next = getNextAvailable(nowIST(), schedule, getBookings());
  const feeValues = Object.values(settings.fees);
  const minFee = Math.min(...feeValues);
  const payLine =
    settings.paymentMode === "pay-at-clinic"
      ? "No advance needed · Pay at clinic"
      : "Small advance token to confirm";

  return (
    <>
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-dark">
              {settings.tagline}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {settings.heroHeadline}
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-smoke">
              {settings.heroSubline}
            </p>
            <p className="mt-5 text-sm font-semibold text-ink">
              {settings.doctorName}
              <span className="mt-0.5 block text-sm font-normal text-smoke">
                {settings.doctorTitle} · Online E-Consultations
              </span>
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn-primary !px-7 !py-3.5 !text-[15px]">
                Book Appointment
              </Link>
              <Link href="/treatments" className="btn-outline !px-6 !py-3.5 !text-[15px]">
                View treatments
              </Link>
            </div>

            <ul className="mt-8 space-y-2.5 text-sm text-ink/85">
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                Plan A: ₹2,000 (1 In-Depth Consult + 4-Week Follow-up Included)
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                Plan B: ₹4,999 (1 Consult + 2 Follow-ups over 3 Months + Routine PDF)
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                1:1 Voice Call · Pay via PhonePe / GPay / Paytm (7049205128)
              </li>
            </ul>

            {next ? (
              <p className="badge badge-open mt-6 !px-3.5 !py-1.5 !text-[13px]">
                Next available: {formatDateLabel(next.date)} ·{" "}
                {formatTime12(next.time)}
              </p>
            ) : (
              <p className="badge badge-closed mt-6 !px-3.5 !py-1.5 !text-[13px]">
                No open slots in the next 14 days — try WhatsApp
              </p>
            )}
          </div>

          <DoctorPortrait />
        </div>
      </section>

      {/* --------------------------- STATS STRIP -------------------------- */}
      <section className="border-b border-line bg-cream/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink sm:text-3xl">439,000+</p>
              <p className="text-xs text-smoke font-medium">YouTube Subscribers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald-dark">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink sm:text-3xl">795+</p>
              <p className="text-xs text-smoke font-medium">Care &amp; Remedy Videos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink sm:text-3xl">39 Million+</p>
              <p className="text-xs text-smoke font-medium">Total Channel Views</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald-dark">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink sm:text-3xl">1:1 Online</p>
              <p className="text-xs text-smoke font-medium">WhatsApp Consultations</p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- TREATMENTS --------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Specialized Care"
          title="Clinical Homeopathy for Skin, Hair & Health"
          subline="Treatment protocols developed through clinical experience and shared with over 430K+ patients and followers worldwide."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((t) => (
            <Link
              key={t.id}
              href={`/treatments#${t.slug}`}
              className="card group p-6 transition-shadow hover:shadow-lift flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-lg text-ink group-hover:text-emerald-dark">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-smoke">
                  {t.desc}
                </p>
              </div>
              <span className="mt-4 inline-block text-sm font-semibold text-emerald-dark">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------- CHOOSE YOUR PLAN ------------------- */}
      <section id="plans" className="border-t border-line bg-gradient-to-b from-cream/30 to-cream/80 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="E-Consultation Platform"
            title="Choose Your Healing Plan"
            subline="Experience expert homeopathy from the comfort of your home via 1:1 voice call with Dr. Arwa Bohra."
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Plan A */}
            <div className="card relative flex flex-col justify-between p-7 sm:p-9 border-2 border-emerald/20 hover:border-emerald-dark/50 transition-all shadow-md bg-paper">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-bold text-emerald-dark uppercase tracking-wider">
                    Plan A · Essential Care
                  </span>
                  <span className="text-xs text-smoke font-medium">1 Month Care</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-ink">₹2,000</span>
                  <span className="text-sm text-smoke">/ in-depth consultation</span>
                </div>
                <p className="mt-3 text-sm text-smoke leading-relaxed">
                  Ideal for focused consultation on skin, hair or acute lifestyle concerns with complete personal guidance.
                </p>

                <div className="rule-gold my-6" aria-hidden="true" />

                <ul className="space-y-3.5 text-sm text-ink/90">
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald-dark font-bold text-xs">✓</span>
                    <span><strong>1 in-depth consultation</strong> (conducted via voice call)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald-dark font-bold text-xs">✓</span>
                    <span><strong>Personalised medicines</strong>, tailored diet &amp; lifestyle advice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald-dark font-bold text-xs">✓</span>
                    <span><strong>Follow-up within 4 weeks:</strong> <span className="text-emerald-dark font-bold">INCLUDED</span></span>
                  </li>
                  <li className="flex items-start gap-3 text-smoke">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream text-smoke font-bold text-xs">•</span>
                    <span>Follow-up after 4 weeks: ₹1,500</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-line">
                <a
                  href={waLink(settings.whatsapp, "Hi Dr. Arwa, I want to book Plan A (₹2000) for my consultation. Please guide me with payment on 7049205128.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full text-center !py-3.5 font-semibold text-emerald-dark border-emerald-dark hover:bg-emerald-soft/50"
                >
                  Book Plan A (₹2,000) →
                </a>
              </div>
            </div>

            {/* Plan B */}
            <div className="card relative flex flex-col justify-between p-7 sm:p-9 border-2 border-gold shadow-xl bg-paper">
              <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-gold to-amber-600 px-4 py-1 text-xs font-bold text-white shadow-md uppercase tracking-wider">
                Most Recommended · 3 Months
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Plan B · Complete Care
                  </span>
                  <span className="text-xs text-smoke font-medium">3 Months Healing</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-ink">₹4,999</span>
                  <span className="text-sm text-smoke">/ full 3 months</span>
                </div>
                <p className="mt-3 text-sm text-smoke leading-relaxed">
                  Best for recurring or long-standing conditions (severe hair fall, stubborn acne, melasma, anxiety, or digestion).
                </p>

                <div className="rule-gold my-6" aria-hidden="true" />

                <ul className="space-y-3.5 text-sm text-ink/90">
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-amber-800 font-bold text-xs">✓</span>
                    <span><strong>1 Consultation + 2 Follow-ups</strong> (spread over 3 months)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-amber-800 font-bold text-xs">✓</span>
                    <span><strong>Regular medicine adjustments</strong> as you heal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-amber-800 font-bold text-xs">✓</span>
                    <span><strong>Custom Healing Routine PDF</strong> (Skin / Hair / Anxiety / Digestion)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs">★</span>
                    <span className="font-semibold text-amber-900">🎁 ₹50 OFF on Hair or Face Serum</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-line">
                <a
                  href={waLink(settings.whatsapp, "Hi Dr. Arwa, I want to book Plan B (₹4999) for my 3-month consultation. Please guide me with payment on 7049205128.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center !py-3.5 font-semibold shadow-md"
                >
                  Book Plan B (₹4,999) →
                </a>
              </div>
            </div>
          </div>

          {/* Payment Guidance Box */}
          <div className="mt-10 rounded-2xl bg-paper border border-line p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
                  Simple &amp; Direct UPI Payment
                </p>
                <h4 className="mt-1 font-display text-xl text-ink">
                  Pay via PhonePe / Google Pay / Paytm
                </h4>
                <p className="mt-2 text-sm text-smoke">
                  Transfer the consultation fee to: <strong className="text-ink text-base">7049205128</strong>, then send receipt on WhatsApp.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="rounded-xl border border-line bg-cream/50 px-5 py-3 text-center">
                  <span className="block text-[11px] font-semibold text-smoke uppercase tracking-wider">UPI / GPay / PhonePe</span>
                  <span className="block font-mono text-xl font-bold text-ink tracking-wide">7049205128</span>
                </div>
                <a
                  href={waLink(settings.whatsapp, "Hi Dr. Arwa, I have paid the consultation fee via UPI (7049205128). Here is my payment receipt.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 !py-3.5 !px-6"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Z"/>
                  </svg>
                  Share Receipt on WhatsApp
                </a>
              </div>
            </div>
            <p className="mt-4 text-xs text-smoke border-t border-line/60 pt-3">
              📞 <strong>Note:</strong> All consultations are conducted 1:1 via unhurried voice call. Your slot will be reserved immediately once the payment receipt is confirmed on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------- OUR BESTSELLERS ----------------------- */}
      <section className="border-y border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Our Bestsellers"
            title="Dr. Arwa’s Signature Hair & Face Serums"
            subline="Pure natural extracts & active homeopathic nourishment — trusted by thousands across India."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Hair Serum */}
            <div className="card p-6 sm:p-8 flex flex-col justify-between border-2 border-emerald-soft hover:border-emerald-dark/30 transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald-dark">
                    Natural Hair Regrowth &amp; Root Strength
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5 border border-amber-200">
                    ₹50 OFF with Plan B
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl text-ink">Dr. Arwa’s Hair Serum</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-ink">₹499</span>
                  <span className="text-xs text-smoke">+ ₹80 shipping</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-smoke">
                  Stops severe hair fall, strengthens root anchors, and stimulates baby hair regrowth. Powered by botanical herbal actives and natural homeopathic tinctures.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-ink/80">
                  <li className="flex items-center gap-2">✓ Natural DHT-blocking nourishment &amp; hair density</li>
                  <li className="flex items-center gap-2">✓ Non-sticky, lightweight daily scalp application</li>
                  <li className="flex items-center gap-2">✓ Free of minoxidil, steroids or harsh preservatives</li>
                </ul>
              </div>
              <a
                href={waLink(settings.whatsapp, "Hi Dr. Arwa, I want to order Dr. Arwa's Hair Serum (₹499 + ₹80 shipping). Please share order & payment details on 7049205128.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 text-center"
              >
                Order Hair Serum on WhatsApp →
              </a>
            </div>

            {/* Face Serum */}
            <div className="card p-6 sm:p-8 flex flex-col justify-between border-2 border-gold/30 hover:border-gold transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Clear Glow &amp; Blemish Free Skin
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5 border border-amber-200">
                    ₹50 OFF with Plan B
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl text-ink">Dr. Arwa’s Face Serum</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-ink">₹549</span>
                  <span className="text-xs text-smoke">+ ₹80 shipping</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-smoke">
                  Targets stubborn pimples, post-acne pigmentation, melasma spots, and dull complexion. Formulated for safe, soothing cellular repair.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-ink/80">
                  <li className="flex items-center gap-2">✓ Fades stubborn marks, melasma &amp; dark spots</li>
                  <li className="flex items-center gap-2">✓ Soothes inflamed acne and prevents recurrence</li>
                  <li className="flex items-center gap-2">✓ 100% gentle homeopathic herbal base</li>
                </ul>
              </div>
              <a
                href={waLink(settings.whatsapp, "Hi Dr. Arwa, I want to order Dr. Arwa's Face Serum (₹549 + ₹80 shipping). Please share order & payment details on 7049205128.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 text-center"
              >
                Order Face Serum on WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- VIDEOS ----------------------------- */}
      {videos.length > 0 && (
        <section className="border-b border-line bg-cream/50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="YouTube & Health Guides"
                  title="Watch Dr. Arwa's Most Popular Videos"
                  subline="Practical homeopathy remedies, mother tinctures, and hair & skin routines with 439,000+ subscribers on @DrArwaBohra."
                />
              </div>
              <a
                href="https://www.youtube.com/@DrArwaBohra?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 rounded-xl bg-[#FF0000] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#CC0000] hover:shadow-md transition-all active:scale-[0.98] self-start md:self-end"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Subscribe on YouTube
              </a>
            </div>
            <div className="mt-10">
              <VideoCarousel videos={videos} />
            </div>
          </div>
        </section>
      )}

      {/* ------------------------- HOW BOOKING WORKS ------------------------ */}
      <section className="border-y border-line bg-cream/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Simple booking"
            title="Book in three quick steps"
          />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "1",
                title: "Choose your mode",
                text: "1:1 voice call or video consultation from the comfort of your home.",
              },
              {
                n: "2",
                title: "Pick a slot",
                text: "Choose a date and time that suits you from live availability.",
              },
              {
                n: "3",
                title: "Confirm on WhatsApp",
                text: "Pay via UPI (7049205128) and share your screenshot on WhatsApp (8319623253).",
              },
            ].map((s) => (
              <li key={s.n} className="card p-6">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald font-display text-lg text-white"
                >
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-lg text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-smoke">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Link href="/book" className="btn-primary !px-7 !py-3.5">
              Start booking
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ ABOUT ------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Meet the doctor"
              title={settings.doctorName}
            />
            <p className="mt-5 text-[15px] leading-relaxed text-smoke">
              {settings.aboutShort}
            </p>
            <Link
              href="/about"
              className="mt-5 inline-block text-sm font-semibold text-emerald-dark underline-offset-4 hover:underline"
            >
              More about the practice →
            </Link>
          </div>
          <div className="card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
              Practice focus
            </p>
            <ul className="mt-4 space-y-3 text-[15px] text-ink/85">
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                Skin concerns — acne, pigmentation, eczema, glow &amp; ageing
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                Hair concerns — hairfall, thinning, dandruff &amp; scalp care
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                Homeopathic consultation for long-standing concerns
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------- TESTIMONIALS --------------------------- */}
      {testimonials.length > 0 && (
        <section className="border-y border-line bg-cream/50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Patient words"
              title="What patients say"
              subline="Reviews marked “Sample” are placeholders the clinic will replace with real patient feedback."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------- FAQ -------------------------------- */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Good to know"
          title="Frequently asked questions"
        />
        <div className="mt-8">
          <FaqAccordion items={faqs} idPrefix="home-faq" />
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/faq"
            className="text-sm font-semibold text-emerald-dark underline-offset-4 hover:underline"
          >
            View all FAQs →
          </Link>
        </div>
      </section>

      {/* ---------------------------- CONTACT CARD ---------------------------- */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Visit or call"
            title="Clinic contact"
          />
          <div className="card mx-auto mt-10 max-w-2xl p-6 text-center sm:p-8">
            <p className="font-display text-xl text-ink">{settings.clinicName}</p>
            <p className="mt-2 text-sm text-smoke">{settings.address}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={`tel:+91${settings.phone}`} className="btn-outline !px-6 !py-3">
                Call +91 {settings.phone}
              </a>
              <a
                href={waLink(
                  settings.whatsapp,
                  "Hi, I want to book an appointment with Dr. Arwa Bohra."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !px-6 !py-3"
              >
                WhatsApp
              </a>
            </div>
            {settings.mapsLink ? (
              <a
                href={settings.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-emerald-dark underline-offset-4 hover:underline"
              >
                Open in Google Maps →
              </a>
            ) : (
              <p className="mt-4 text-xs text-smoke">
                Map link will be added by the clinic.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
