import Link from "next/link";
import type { Metadata } from "next";
import { getBookingByToken, getSettings, STATUS_LABEL } from "@/lib/data";
import {
  formatDateLabel,
  formatTime12,
  formatINR,
  modeLabel,
  waLink,
} from "@/lib/data-client";
import { BookHeader, BookFooter } from "@/components/book/chrome";
import { googleCalendarUrl } from "@/components/book/utils";
import ManageBooking from "./manage";

export const metadata: Metadata = {
  title: "My Booking — Dr. Arwa Bohra",
};

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold-soft text-gold-dark",
  confirmed: "bg-emerald-soft text-emerald-dark",
  cancelled: "bg-cream text-smoke",
  visited: "bg-emerald-soft text-emerald-dark",
  "no-show": "bg-cream text-smoke",
};

export default function MyBookingPage({
  params,
}: {
  params: { token: string };
}) {
  const settings = getSettings();
  const booking = getBookingByToken(params.token);

  return (
    <>
      <BookHeader title="My booking" />
      <main className="mx-auto max-w-xl px-4 pb-16 pt-6">
        {!booking ? (
          <div className="card p-8 text-center">
            <div className="rule-gold mx-auto mb-5" />
            <h1 className="font-display text-2xl text-ink">
              Booking not found
            </h1>
            <p className="mt-2 text-sm text-smoke">
              This link looks incorrect or expired. Bookings can be managed
              from the link shared at booking time.
            </p>
            <Link href="/book" className="btn-primary mt-6">
              Book a new appointment
            </Link>
          </div>
        ) : (
          <>
            <div className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-smoke">
                    Booking ID
                  </p>
                  <p className="font-mono text-xl font-bold tracking-widest text-ink">
                    {booking.id}
                  </p>
                </div>
                <span
                  className={`badge ${STATUS_STYLE[booking.status] ?? "badge-closed"}`}
                >
                  {STATUS_LABEL[booking.status]}
                </span>
              </div>

              <div className="mt-4 border-t border-line/70 pt-2 text-sm">
                <Row k="Doctor" v={settings.doctorName} />
                <Row k="Mode" v={modeLabel(booking.mode)} />
                <Row
                  k="Slot"
                  v={`${formatDateLabel(booking.date)} · ${formatTime12(booking.time)}`}
                />
                <Row
                  k="Patient"
                  v={`${booking.name}, ${booking.age} yrs${booking.forSelf ? "" : ` · ${booking.relation ?? ""}`}`}
                />
                <Row k="Mobile" v={booking.mobile} />
                <Row k="Concern" v={booking.reasons.join(", ")} />
                {booking.complaint && (
                  <Row k="Complaint" v={booking.complaint} />
                )}
                <Row
                  k="Fee"
                  v={`${formatINR(settings.fees[booking.mode])}${settings.paymentMode === "pay-at-clinic" ? " — pay at clinic" : ""}`}
                  last
                />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-smoke">
                {settings.cancellationPolicy}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <a
                href={googleCalendarUrl({
                  title: `Appointment — Dr. Arwa Bohra (${booking.id})`,
                  date: booking.date,
                  time: booking.time,
                  durationMin: settings.slotDurationMin,
                  details: `Booking ID: ${booking.id}\nMode: ${modeLabel(booking.mode)}\nPatient: ${booking.name}`,
                  location:
                    booking.mode === "in-clinic" ? settings.address : "Online",
                })}
                target="_blank"
                rel="noreferrer"
                className="btn-outline w-full"
              >
                Add to Google Calendar
              </a>
              <a
                href={waLink(
                  settings.whatsapp,
                  `Hi, I have a question about my appointment ${booking.id} (${formatDateLabel(booking.date)}, ${formatTime12(booking.time)}).`
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-outline w-full"
              >
                WhatsApp the clinic
              </a>
            </div>

            <ManageBooking
              booking={booking}
              whatsapp={settings.whatsapp}
              phone={settings.phone}
            />
          </>
        )}
      </main>
      <BookFooter phone={settings.phone} />
    </>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div
      className={`flex items-start justify-between gap-3 py-2 ${last ? "" : "border-b border-line/70"}`}
    >
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-smoke">
        {k}
      </span>
      <span className="text-right text-sm font-medium text-ink">{v}</span>
    </div>
  );
}
