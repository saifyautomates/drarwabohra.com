"use client";

import { useState } from "react";
import type { Booking } from "@/lib/data";
import {
  formatDateLabel,
  formatTime12,
} from "@/lib/data-client";
import { groupSlots, next14Days } from "@/components/book/utils";

interface Slot {
  time: string;
  available: boolean;
}

const RESCHEDULE_CUTOFF_MS = 4 * 60 * 60 * 1000;

export default function ManageBooking({
  booking: initial,
  whatsapp,
  phone,
}: {
  booking: Booking;
  whatsapp: string;
  phone: string;
}) {
  const [booking, setBooking] = useState<Booking>(initial);
  const [rescheduling, setRescheduling] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const days = next14Days();
  const isCancelled = booking.status === "cancelled";
  const isPastStatus =
    booking.status === "visited" || booking.status === "no-show";
  // Parse the appointment as IST so the cutoff matches the server's.
  const apptStart = new Date(`${booking.date}T${booking.time}:00+05:30`).getTime();
  const tooClose = apptStart - Date.now() < RESCHEDULE_CUTOFF_MS;
  const canReschedule =
    !isCancelled && !isPastStatus && (booking.status === "pending" || booking.status === "confirmed") && !tooClose;
  const canCancel = !isCancelled && !isPastStatus;

  const loadDay = async (d: string) => {
    setDate(d);
    setTime(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/availability?date=${d}&mode=${booking.mode}`
      );
      const json = await res.json();
      setSlots(res.ok ? (json.slots ?? []) : []);
    } finally {
      setLoading(false);
    }
  };

  const doReschedule = async () => {
    if (!date || !time) {
      setError("Pick a new date and time slot.");
      return;
    }
    setError(null);
    setConfirming(true);
    try {
      const res = await fetch(`/api/my-booking/${booking.token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not reschedule. Please try again.");
        return;
      }
      setBooking(json.booking);
      setRescheduling(false);
      setDate(null);
      setTime(null);
      setNotice(
        `Rescheduled to ${formatDateLabel(json.booking.date)} · ${formatTime12(json.booking.time)}.`
      );
    } finally {
      setConfirming(false);
    }
  };

  const doCancel = async () => {
    setError(null);
    setCancelling(true);
    try {
      const res = await fetch(`/api/my-booking/${booking.token}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not cancel. Please try again.");
        return;
      }
      setBooking(json.booking);
      setConfirmCancel(false);
      setRescheduling(false);
      setNotice("Your appointment has been cancelled.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {notice && (
        <div className="rounded-xl border border-emerald/30 bg-emerald-soft px-4 py-3 text-sm font-medium text-emerald-dark">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-[#E7C8C0] bg-[#FBEDEC] px-4 py-3 text-sm text-[#A03A2F]">
          {error}
        </div>
      )}

      {canReschedule && !rescheduling && (
        <button
          onClick={() => {
            setRescheduling(true);
            setNotice(null);
          }}
          className="btn-outline w-full"
        >
          Reschedule appointment
        </button>
      )}
      {!canReschedule && !isCancelled && !isPastStatus && (
        <p className="rounded-xl bg-cream px-4 py-3 text-xs leading-relaxed text-smoke">
          Rescheduling is allowed until 4 hours before your appointment. Your
          slot is too close now — please call or WhatsApp the clinic at{" "}
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-emerald-dark underline-offset-2 hover:underline"
          >
            WhatsApp
          </a>{" "}
          or{" "}
          <a
            href={`tel:+91${phone}`}
            className="font-semibold text-emerald-dark underline-offset-2 hover:underline"
          >
            +91 {phone}
          </a>
          .
        </p>
      )}

      {rescheduling && (
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink">Choose a new slot</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d) => {
              const selected = date === d;
              const [yy, mm, dd] = d.split("-").map(Number);
              const dt = new Date(yy, mm - 1, dd);
              const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                dt.getDay()
              ];
              return (
                <button
                  key={d}
                  onClick={() => void loadDay(d)}
                  className={`flex min-w-[64px] flex-col items-center rounded-xl border px-2 py-2.5 transition-colors ${
                    selected
                      ? "border-emerald bg-emerald text-white"
                      : "border-line bg-white text-ink hover:border-emerald/50"
                  }`}
                >
                  <span className="text-[11px] font-medium">{dayName}</span>
                  <span className="text-lg font-bold leading-tight">{dd}</span>
                </button>
              );
            })}
          </div>

          {loading && <p className="mt-4 text-sm text-smoke">Loading slots…</p>}

          {date && !loading && slots.length === 0 && (
            <p className="mt-4 text-sm text-smoke">
              No slots on {formatDateLabel(date)}. Try another day.
            </p>
          )}

          {date && !loading && slots.length > 0 && (
            <div className="mt-4 space-y-4">
              {groupSlots(slots).map((g) => (
                <div key={g.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-smoke">
                    {g.label}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {g.slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => setTime(s.time)}
                        className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors ${
                          time === s.time
                            ? "border-emerald bg-emerald text-white"
                            : s.available
                              ? "border-line bg-white text-ink hover:border-emerald/60"
                              : "cursor-not-allowed border-line bg-cream/60 text-smoke/40 line-through"
                        }`}
                      >
                        {formatTime12(s.time)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => {
                setRescheduling(false);
                setDate(null);
                setTime(null);
                setError(null);
              }}
              className="btn-outline"
            >
              Back
            </button>
            <button
              onClick={doReschedule}
              disabled={confirming || !date || !time}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {confirming ? "Rescheduling…" : "Confirm new slot"}
            </button>
          </div>
        </div>
      )}

      {canCancel && !confirmCancel && (
        <button
          onClick={() => {
            setConfirmCancel(true);
            setNotice(null);
          }}
          className="w-full rounded-xl border border-[#E7C8C0] bg-white px-4 py-2.5 text-sm font-semibold text-[#A03A2F] transition-colors hover:bg-[#FBEDEC]"
        >
          Cancel appointment
        </button>
      )}

      {confirmCancel && (
        <div className="rounded-2xl border border-[#E7C8C0] bg-[#FBEDEC] p-5">
          <p className="text-sm font-semibold text-[#A03A2F]">
            Cancel this appointment?
          </p>
          <p className="mt-1 text-sm text-[#A03A2F]/80">
            {formatDateLabel(booking.date)} · {formatTime12(booking.time)} will
            be released for other patients. This cannot be undone.
          </p>
          <div className="mt-4 flex gap-2.5">
            <button
              onClick={() => setConfirmCancel(false)}
              className="btn-outline flex-1"
            >
              Keep it
            </button>
            <button
              onClick={doCancel}
              disabled={cancelling}
              className="flex-1 rounded-xl bg-[#A03A2F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#843026] disabled:opacity-60"
            >
              {cancelling ? "Cancelling…" : "Yes, cancel"}
            </button>
          </div>
        </div>
      )}

      {isCancelled && (
        <p className="rounded-xl bg-cream px-4 py-3 text-center text-sm text-smoke">
          This appointment is cancelled.{" "}
          <a
            href="/book"
            className="font-semibold text-emerald-dark underline-offset-2 hover:underline"
          >
            Book a new one
          </a>
        </p>
      )}
    </div>
  );
}
