import type { Metadata } from "next";
import { getSchedule, getSettings } from "@/lib/data";
import type { ConsultMode, Schedule, WeekDay } from "@/lib/data";
import { WEEKDAY_LABEL, formatINR, formatTime12, waLink } from "@/lib/data-client";
import SectionHeading from "@/components/site/SectionHeading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact — Dr. Arwa Bohra | E-Consultation Platform",
  description:
    "Get in touch with Dr. Arwa Bohra for 1:1 online voice call consultations, medicine guidance, and queries.",
};

const DAY_ORDER: WeekDay[] = ["1", "2", "3", "4", "5", "6", "0"];
const MODE_ORDER: ConsultMode[] = ["audio", "video"];
const MODE_SHORT: Record<ConsultMode, string> = {
  "in-clinic": "Voice Call",
  video: "Video Call",
  audio: "Voice Call",
};

/** Compact per-day summary, e.g. "In-clinic 10:00 AM–1:00 PM · Video 4:00 PM–6:00 PM". */
function daySummary(s: Schedule, d: WeekDay): string | null {
  const h = s.hours[d];
  const parts: string[] = [];
  for (const m of MODE_ORDER) {
    const w = h[m];
    if (w) parts.push(`${MODE_SHORT[m]} ${formatTime12(w.start)}–${formatTime12(w.end)}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

/** Group consecutive days sharing the same hours. */
function summarizeHours(s: Schedule): { days: string; hours: string }[] {
  const rows: { days: string; hours: string }[] = [];
  let start = 0;
  const summaries = DAY_ORDER.map((d) => daySummary(s, d));

  for (let i = 1; i <= DAY_ORDER.length; i++) {
    if (i < DAY_ORDER.length && summaries[i] === summaries[start]) continue;
    const from = WEEKDAY_LABEL[DAY_ORDER[start]].slice(0, 3);
    const to = WEEKDAY_LABEL[DAY_ORDER[i - 1]].slice(0, 3);
    rows.push({
      days: start === i - 1 ? from : `${from} – ${to}`,
      hours: summaries[start] ?? "Closed",
    });
    start = i;
  }
  return rows;
}

export default function ContactPage() {
  const settings = getSettings();
  const schedule = getSchedule();
  const hours = summarizeHours(schedule);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch"
        subline="Call, WhatsApp or book your 1:1 voice consultation online."
      />

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
            E-Consultation Support
          </p>
          <p className="mt-3 font-display text-xl text-ink">
            {settings.doctorName}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-smoke">
            {settings.address}
          </p>

          <div className="mt-6 space-y-3">
            <a
              href={`tel:+91${settings.phone}`}
              className="btn-outline w-full !py-3"
            >
              Call +91 {settings.phone}
            </a>
            <a
              href={waLink(
                settings.whatsapp,
                "Hi, I want to book an online consultation with Dr. Arwa Bohra."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full !py-3"
            >
              WhatsApp Support
            </a>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={settings.youtube || "https://www.youtube.com/@DrArwaBohra"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#FF0000] !py-3 !px-3 text-sm font-bold text-white shadow-sm hover:bg-[#CC0000] hover:shadow-md transition-all active:scale-[0.98]"
              >
                <svg className="h-5 w-5 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube</span>
              </a>
              <a
                href={settings.instagram || "https://www.instagram.com/drarwabohra/"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] !py-3 !px-3 text-sm font-bold text-white shadow-sm hover:opacity-95 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <svg className="h-5 w-5 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
            {settings.mapsLink ? (
              <a
                href={settings.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full !py-3"
              >
                Open in Google Maps
              </a>
            ) : (
              <p className="text-center text-xs text-smoke">
                Online &amp; in-clinic consultations available.
              </p>
            )}
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
            Working hours
          </p>
          <dl className="mt-4 space-y-3">
            {hours.map((r) => (
              <div
                key={r.days}
                className="flex flex-col gap-0.5 border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-sm font-semibold text-ink">{r.days}</dt>
                <dd className="text-sm text-smoke">{r.hours}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-smoke">
            Consultation Plans — Plan A: ₹2,000 (Includes 4-week follow-up) · Plan B: ₹4,999 (3-month healing + 2 follow-ups + Routine PDF). Pay via PhonePe / Google Pay / Paytm to <strong>7049205128</strong> and share screenshot on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
