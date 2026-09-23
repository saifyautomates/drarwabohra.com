"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ConsultMode } from "@/lib/data";
import {
  formatINR,
  formatDateLabel,
  formatTime12,
  modeLabel,
  waLink,
} from "@/lib/data-client";
import {
  googleCalendarUrl,
  groupSlots,
  next14Days,
  bookingWhatsAppText,
} from "@/components/book/utils";

/* ------------------------------------------------------------------ */

export interface WizardSettings {
  doctorName: string;
  doctorTitle: string;
  fees: Record<ConsultMode, number>;
  phone: string;
  whatsapp: string;
  address: string;
  mapsLink: string;
  cancellationPolicy: string;
  paymentMode: "pay-at-clinic" | "advance-token";
  slotDurationMin: number;
}

export interface NextSlot {
  date: string;
  time: string;
}

export interface WizardProps {
  settings: WizardSettings;
  initialMode: ConsultMode | null;
  initialReason: string | null;
  nextByMode: Record<ConsultMode, NextSlot | null>;
}

interface Slot {
  time: string;
  available: boolean;
}

const STEP_LABELS = [
  "Mode",
  "Concern",
  "Slot",
  "Mobile",
  "Details",
  "Intake",
  "Review",
];

const REASONS = [
  "Acne & Pimples",
  "Pigmentation",
  "Hairfall",
  "Dandruff",
  "Eczema",
  "Skin Glow",
  "Follow-up visit",
  "Other",
];

const RELATIONS = [
  "Mother",
  "Father",
  "Spouse",
  "Son",
  "Daughter",
  "Sibling",
  "Other",
];

const MODES: ConsultMode[] = ["audio", "video"];

const MODE_BLURB: Record<ConsultMode, string> = {
  "in-clinic": "Voice Call Consultation",
  audio: "Direct 1:1 Voice Call with Dr. Arwa",
  video: "Video call from anywhere",
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function ModeIcon({ mode }: { mode: ConsultMode }) {
  const common = "h-6 w-6";
  if (mode === "in-clinic")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <path d="M3 21h18M5 21V8l7-5 7 5v13" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21v-6h6v6M12 8v4M10 10h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (mode === "video")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <rect x="2" y="6" width="13" height="12" rx="2" />
        <path d="m15 10 6-3v10l-6-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-xl border border-[#E7C8C0] bg-[#FBEDEC] px-4 py-3 text-sm text-[#A03A2F]">
      {message}
    </div>
  );
}

/** 6-box OTP input with auto-advance, backspace nav and paste support. */
function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const setAt = (i: number, ch: string) => {
    const next = value.split("");
    next[i] = ch;
    onChange(next.join("").replace(/\s/g, ""));
  };

  return (
    <div className="flex gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d.trim()}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, ch);
            if (ch && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i].trim() && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            onChange(pasted);
            const focusIdx = Math.min(pasted.length, 5);
            refs.current[focusIdx]?.focus();
          }}
          className="h-12 w-full rounded-xl border border-line bg-white text-center text-lg font-semibold text-ink outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald/15"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wizard                                                              */
/* ------------------------------------------------------------------ */

export default function Wizard({
  settings,
  initialMode,
  initialReason,
  nextByMode,
}: WizardProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ConsultMode | null>(initialMode);
  const [reasons, setReasons] = useState<string[]>(
    initialReason ? [initialReason] : []
  );
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [daySlots, setDaySlots] = useState<Record<string, Slot[]>>({});
  const [daysLoading, setDaysLoading] = useState(false);
  const [fetchedFor, setFetchedFor] = useState<ConsultMode | null>(null);

  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  // Single-use server nonce minted by POST /api/otp/verify — sent back
  // with the booking request so /api/book can prove the OTP was verified.
  const [otpNonce, setOtpNonce] = useState<string | null>(null);

  const [forSelf, setForSelf] = useState(true);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [relation, setRelation] = useState("");

  const [complaint, setComplaint] = useState("");
  const [medicines, setMedicines] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string; token: string } | null>(
    null
  );

  const days = next14Days();

  const fetchDays = useCallback(
    async (m: ConsultMode) => {
      setDaysLoading(true);
      try {
        const results = await Promise.all(
          next14Days().map(async (d) => {
            const res = await fetch(
              `/api/availability?date=${d}&mode=${m}`
            );
            if (!res.ok) return { d, slots: [] as Slot[] };
            const json = await res.json();
            return { d, slots: (json.slots ?? []) as Slot[] };
          })
        );
        const map: Record<string, Slot[]> = {};
        for (const r of results) map[r.d] = r.slots;
        setDaySlots(map);
        setFetchedFor(m);
      } finally {
        setDaysLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (mode && fetchedFor !== mode) {
      setDate(null);
      setTime(null);
      void fetchDays(mode);
    }
  }, [mode, fetchedFor, fetchDays]);

  // Auto-select the earliest available slot when day data arrives.
  useEffect(() => {
    if (mode && fetchedFor === mode && !date) {
      const next = nextByMode[mode];
      if (next) {
        setDate(next.date);
        setTime(next.time);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedFor]);

  const go = (n: number) => {
    setError(null);
    setStep(n);
    window.scrollTo({ top: 0 });
  };

  const dayStatus = (d: string): "closed" | "full" | "open" => {
    const slots = daySlots[d] ?? [];
    if (slots.length === 0) return "closed";
    if (slots.every((s) => !s.available)) return "full";
    return "open";
  };

  /* ---------------- per-step validation ---------------- */

  const validate = (s: number): string | null => {
    if (s === 1 && !mode) return "Choose how you'd like to consult.";
    if (s === 2 && reasons.length === 0)
      return "Pick at least one concern so the doctor can prepare.";
    if (s === 3) {
      if (!date || !time) return "Pick a date and a time slot.";
    }
    if (s === 4) {
      if (!/^[6-9]\d{9}$/.test(mobile))
        return "Enter a valid 10-digit mobile number.";
      if (!otpVerified) return "Verify your mobile number with the OTP.";
    }
    if (s === 5) {
      if (name.trim().length < 2) return "Enter the patient's full name.";
      const a = Number(age);
      if (!Number.isInteger(a) || a < 0 || a > 120)
        return "Enter a valid age (0–120).";
      if (!gender) return "Select a gender.";
      if (!forSelf && relation.length < 2)
        return "Mention your relation with the patient.";
    }
    if (s === 6) {
      if (complaint.trim().length < 10)
        return "Describe the main complaint in a few words (min 10 characters).";
    }
    return null;
  };

  const next = () => {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < 7) go(step + 1);
  };

  /* ---------------- actions ---------------- */

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number first.");
      return;
    }
    setError(null);
    setOtpSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not send OTP. Please try again.");
        return;
      }
      setOtpSent(true);
      setOtp("");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    setOtpVerifying(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, code: otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Incorrect code. Please try again.");
        return;
      }
      setOtpNonce(typeof json.otpNonce === "string" ? json.otpNonce : null);
      setOtpVerified(true);
    } finally {
      setOtpVerifying(false);
    }
  };

  const confirmBooking = async () => {
    if (!mode || !date || !time) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          reasons,
          date,
          time,
          name: name.trim(),
          age: Number(age),
          gender,
          forSelf,
          relation: forSelf ? undefined : relation,
          mobile,
          complaint: complaint.trim(),
          medicines: medicines.trim() || undefined,
          otpNonce,
        }),
      });
      const json = await res.json();
      if (res.status === 409) {
        setError(json.error ?? "This slot was just taken.");
        if (mode) void fetchDays(mode); // refresh so the taken slot shows
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setConfirmed({ id: json.id, token: json.token });
      window.scrollTo({ top: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- confirmation screen ---------------- */

  if (confirmed && mode && date && time) {
    const dateLabel = formatDateLabel(date);
    const timeLabel = formatTime12(time);
    const fee = settings.fees[mode];
    const calUrl = googleCalendarUrl({
      title: `Appointment — Dr. Arwa Bohra (${confirmed.id})`,
      date,
      time,
      durationMin: settings.slotDurationMin,
      details: `Booking ID: ${confirmed.id}\nMode: ${modeLabel(mode)}\nPatient: ${name.trim()}`,
      location: "Online E-Consultation",
    });
    const waConfirm = waLink(
      settings.whatsapp,
      bookingWhatsAppText(confirmed.id, modeLabel(mode), dateLabel, timeLabel, name.trim())
    );
    return (
      <main className="mx-auto max-w-xl px-4 pb-16 pt-8">
        <div className="card p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-soft">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0E5E4A" strokeWidth="2.2" className="h-7 w-7">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-2xl text-ink">
            Appointment booked
          </h1>
          <p className="mt-1 text-sm text-smoke">
            Your booking ID — keep it handy
          </p>
          <p className="mt-3 inline-block rounded-xl bg-cream px-5 py-2.5 font-mono text-2xl font-bold tracking-widest text-ink">
            {confirmed.id}
          </p>
          <div className="mt-5 rounded-xl border border-line bg-paper px-4 py-3 text-left text-sm">
            <Row k="Doctor" v={`${settings.doctorName}`} />
            <Row k="Mode" v={modeLabel(mode)} />
            <Row k="Slot" v={`${dateLabel} · ${timeLabel}`} />
            <Row k="Patient" v={`${name.trim()}${forSelf ? "" : ` (${relation})`}, ${age} yrs`} />
            <Row k="Fee" v={formatINR(fee)} last />
          </div>

          <div className="mt-5 rounded-xl border border-emerald-dark/20 bg-emerald-soft/30 p-4 text-left text-sm text-ink">
            <p className="font-bold text-emerald-dark flex items-center gap-1.5">
              <span>💳</span> Complete Payment via PhonePe / GPay / Paytm
            </p>
            <p className="mt-1 text-xs text-smoke">
              Please transfer your consultation fee (Plan A: ₹2,000 / Plan B: ₹4,999) to:
            </p>
            <div className="my-2.5 rounded-lg bg-paper p-2.5 text-center font-mono font-bold text-lg text-ink border border-line shadow-inner">
              7049205128
            </div>
            <p className="text-xs text-smoke">
              📩 Then share your payment receipt on WhatsApp at <strong>+91 83196 23253</strong> with your Booking ID: <strong>{confirmed.id}</strong>.
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-dark">
              📞 Dr. Arwa Bohra will connect with you via voice call at your scheduled time.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <a href={calUrl} target="_blank" rel="noreferrer" className="btn-outline w-full">
              Add to Google Calendar
            </a>
            <a href={waConfirm} target="_blank" rel="noreferrer" className="btn-outline w-full">
              Confirm on WhatsApp
            </a>
          </div>
          <Link href={`/my-booking/${confirmed.token}`} className="btn-primary mt-3 w-full">
            Manage booking
          </Link>
          <Link href="/book" className="mt-4 inline-block text-sm font-semibold text-emerald-dark underline-offset-2 hover:underline">
            Book another appointment
          </Link>
        </div>
      </main>
    );
  }

  /* ---------------- wizard ---------------- */

  const selectedSlots = date ? (daySlots[date] ?? []) : [];
  const selectedStatus = date ? dayStatus(date) : "closed";
  const fee = mode ? settings.fees[mode] : 0;

  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-6">
      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-smoke">
            Step {step} of 7
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-dark">
            {STEP_LABELS[step - 1]}
          </p>
        </div>
        <div className="mt-2 flex gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => i + 1 < step && go(i + 1)}
              disabled={i + 1 >= step}
              aria-label={label}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-emerald" : "bg-line"
              } ${i + 1 < step ? "cursor-pointer" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Sticky summary — steps 5–7 (Doctolib pattern) */}
      {step >= 5 && mode && (
        <div className="sticky top-[57px] z-20 mb-4 rounded-xl border border-line bg-white px-4 py-2.5 shadow-card">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-ink">{modeLabel(mode)}</span>
            <span className="text-smoke">
              {date ? `${formatDateLabel(date)}${time ? ` · ${formatTime12(time)}` : ""}` : "Slot not chosen"}
            </span>
            <span className="font-semibold text-emerald-dark">{formatINR(fee)}</span>
          </div>
        </div>
      )}

      <ErrorBanner message={error} />

      {/* ---------------- Step 1: Mode ---------------- */}
      {step === 1 && (
        <section>
          <h1 className="font-display text-2xl text-ink">How would you like to consult?</h1>
          <p className="mt-1 text-sm text-smoke">
            Choose voice call or video — all are 1:1 direct consultations with {settings.doctorName}.
          </p>
          <div className="mt-5 space-y-3">
            {MODES.map((m) => {
              const next = nextByMode[m];
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-emerald bg-emerald-soft/40 shadow-card"
                      : "border-line bg-white hover:border-emerald/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-emerald text-white" : "bg-cream text-emerald-dark"}`}>
                      <ModeIcon mode={m} />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{modeLabel(m)}</p>
                      <p className="text-xs text-smoke">{MODE_BLURB[m]}</p>
                    </div>
                    <p className="text-sm font-bold text-ink">{formatINR(settings.fees[m])}</p>
                  </div>
                  <p className="mt-2 text-xs text-smoke">
                    {next ? (
                      <>
                        Next available:{" "}
                        <span className="font-semibold text-emerald-dark">
                          {formatDateLabel(next.date)} · {formatTime12(next.time)}
                        </span>
                      </>
                    ) : (
                      "No open slots in the next 14 days"
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- Step 2: Concern ---------------- */}
      {step === 2 && (
        <section>
          <h1 className="font-display text-2xl text-ink">What&rsquo;s bothering you?</h1>
          <p className="mt-1 text-sm text-smoke">
            Pick all that apply. This helps the doctor prepare — a full diagnosis
            happens during your consult.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {REASONS.map((r) => {
              const on = reasons.includes(r);
              return (
                <button
                  key={r}
                  onClick={() =>
                    setReasons((prev) =>
                      on ? prev.filter((x) => x !== r) : [...prev, r]
                    )
                  }
                  aria-pressed={on}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                    on
                      ? "border-emerald bg-emerald text-white"
                      : "border-line bg-white text-ink hover:border-emerald/50"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
          <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-xs leading-relaxed text-smoke">
            Homeopathy treats the root cause, not just the symptom. Acne,
            pigmentation, hairfall and similar concerns respond well to a
            proper consultation and consistent follow-up.
          </p>
        </section>
      )}

      {/* ---------------- Step 3: Slot ---------------- */}
      {step === 3 && mode && (
        <section>
          <h1 className="font-display text-2xl text-ink">Pick a date &amp; time</h1>
          <p className="mt-1 text-sm text-smoke">
            {modeLabel(mode)} · {formatINR(settings.fees[mode])} ·{" "}
            {settings.slotDurationMin}-minute slots
          </p>

          {daysLoading && (
            <p className="mt-4 text-sm text-smoke">Loading slots…</p>
          )}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d) => {
              const status = dayStatus(d);
              const selected = date === d;
              const isNext = nextByMode[mode]?.date === d;
              const [yy, mm, dd] = d.split("-").map(Number);
              const dt = new Date(yy, mm - 1, dd);
              const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
              return (
                <button
                  key={d}
                  disabled={status === "closed"}
                  onClick={() => {
                    setDate(d);
                    setTime(null);
                    setError(null);
                  }}
                  className={`relative flex min-w-[64px] flex-col items-center rounded-xl border px-2 py-2.5 transition-colors ${
                    selected
                      ? "border-emerald bg-emerald text-white"
                      : status === "closed"
                        ? "cursor-not-allowed border-line bg-cream/60 text-smoke/50"
                        : "border-line bg-white text-ink hover:border-emerald/50"
                  }`}
                >
                  {isNext && !selected && (
                    <span className="absolute -top-1 h-2 w-2 rounded-full bg-gold" title="Next available" />
                  )}
                  <span className="text-[11px] font-medium">{dayName}</span>
                  <span className="text-lg font-bold leading-tight">{dd}</span>
                  <span className="text-[10px]">
                    {status === "closed" ? "Closed" : status === "full" ? "Full" : "Open"}
                  </span>
                </button>
              );
            })}
          </div>

          {date && selectedStatus !== "closed" && (
            <div className="mt-5 space-y-4">
              {groupSlots(selectedSlots).map((g) => (
                <div key={g.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-smoke">
                    {g.label}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {g.slots.map((s) => {
                      const selected = time === s.time;
                      return (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => {
                            setTime(s.time);
                            setError(null);
                          }}
                          className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors ${
                            selected
                              ? "border-emerald bg-emerald text-white"
                              : s.available
                                ? "border-line bg-white text-ink hover:border-emerald/60"
                                : "cursor-not-allowed border-line bg-cream/60 text-smoke/40 line-through"
                          }`}
                        >
                          {formatTime12(s.time)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {selectedStatus === "full" && (
                <WaitlistCard
                  mode={mode}
                  date={date}
                  whatsapp={settings.whatsapp}
                  reason="This day is fully booked."
                />
              )}
            </div>
          )}

          {date && selectedStatus === "closed" && (
            <WaitlistCard
              mode={mode}
              date={date}
              whatsapp={settings.whatsapp}
              reason="The clinic is closed on this day."
            />
          )}

          {!date && !daysLoading && (
            <p className="mt-4 text-sm text-smoke">
              Select a date above to see available time slots.
            </p>
          )}
        </section>
      )}

      {/* ---------------- Step 4: Mobile / OTP ---------------- */}
      {step === 4 && (
        <section>
          <h1 className="font-display text-2xl text-ink">Verify your mobile number</h1>
          <p className="mt-1 text-sm text-smoke">
            We&rsquo;ll send booking updates and reminders on this number.
          </p>

          <div className="mt-5 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3 text-sm text-ink">
            <span className="font-semibold">Demo mode —</span> enter any 6-digit
            code. The MSG91 integration point is marked in the code for the real
            SMS flow.
          </div>

          <label htmlFor="mobile" className="field-label mt-5">
            Mobile number
          </label>
          <div className="flex gap-2">
            <input
              id="mobile"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              disabled={otpVerified}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                setOtpSent(false);
                setOtpVerified(false);
                setOtpNonce(null);
              }}
              placeholder="10-digit mobile number"
              className="input"
            />
            {!otpVerified && (
              <button
                onClick={sendOtp}
                disabled={otpSending}
                className="btn-outline shrink-0 disabled:opacity-60"
              >
                {otpSending ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            )}
          </div>

          {otpSent && !otpVerified && (
            <div className="mt-5">
              <label className="field-label">Enter the 6-digit code</label>
              <OtpBoxes value={otp} onChange={setOtp} />
              <button
                onClick={verifyOtp}
                disabled={otpVerifying}
                className="btn-primary mt-4 w-full disabled:opacity-60"
              >
                {otpVerifying ? "Verifying…" : "Verify"}
              </button>
            </div>
          )}

          {otpVerified && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald/30 bg-emerald-soft px-4 py-3 text-sm font-medium text-emerald-dark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mobile number verified
            </div>
          )}
        </section>
      )}

      {/* ---------------- Step 5: Details ---------------- */}
      {step === 5 && (
        <section>
          <h1 className="font-display text-2xl text-ink">Who is this appointment for?</h1>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {[
              { v: true, label: "Myself" },
              { v: false, label: "Someone else" },
            ].map((o) => (
              <button
                key={o.label}
                onClick={() => {
                  setForSelf(o.v);
                  setError(null);
                }}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  forSelf === o.v
                    ? "border-emerald bg-emerald text-white"
                    : "border-line bg-white text-ink hover:border-emerald/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {!forSelf && (
              <div>
                <label htmlFor="relation" className="field-label">
                  Relation with the patient
                </label>
                <select
                  id="relation"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="input"
                >
                  <option value="">Select relation…</option>
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="pname" className="field-label">
                {forSelf ? "Your full name" : "Patient's full name"}
              </label>
              <input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="input"
                autoComplete="name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="age" className="field-label">
                  Age
                </label>
                <input
                  id="age"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="Years"
                  className="input"
                />
              </div>
              <div>
                <span className="field-label">Gender</span>
                <div className="flex gap-2">
                  {["Female", "Male", "Other"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                        gender === g
                          ? "border-emerald bg-emerald text-white"
                          : "border-line bg-white text-ink hover:border-emerald/50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Step 6: Intake ---------------- */}
      {step === 6 && (
        <section>
          <h1 className="font-display text-2xl text-ink">A few quick details</h1>
          <p className="mt-1 text-sm text-smoke">
            This goes to the doctor before your consult — keep it brief.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="complaint" className="field-label">
                Main complaint
              </label>
              <textarea
                id="complaint"
                rows={4}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="e.g. Pimples on cheeks and forehead for 6 months, worse in summer…"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="medicines" className="field-label">
                Current medicines <span className="font-normal text-smoke">(optional)</span>
              </label>
              <textarea
                id="medicines"
                rows={2}
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
                placeholder="Any medicines, creams or supplements you currently use…"
                className="input"
              />
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-smoke">
            You can share photos or reports directly on WhatsApp after booking — no need to upload anything here.
          </div>
        </section>
      )}

      {/* ---------------- Step 7: Review ---------------- */}
      {step === 7 && mode && date && time && (
        <section>
          <h1 className="font-display text-2xl text-ink">Review &amp; confirm</h1>
          <p className="mt-1 text-sm text-smoke">
            Check the details below, then confirm your appointment.
          </p>
          <div className="card mt-5 p-5">
            <Row k="Doctor" v={`${settings.doctorName} — ${settings.doctorTitle}`} />
            <Row k="Mode" v={modeLabel(mode)} />
            <Row k="Slot" v={`${formatDateLabel(date)} · ${formatTime12(time)}`} />
            <Row k="Patient" v={`${name.trim()}, ${age} yrs${forSelf ? "" : ` · ${relation}`}`} />
            <Row k="Mobile" v={mobile} />
            <Row k="Concern" v={reasons.join(", ")} />
            <Row k="Fee" v={formatINR(settings.fees[mode])} last />
          </div>
          <div className="mt-4 rounded-xl border border-emerald-soft bg-emerald-soft/30 p-4 text-xs leading-relaxed">
            <p className="font-bold text-emerald-dark">
              💳 UPI Payment (PhonePe / GPay / Paytm): <span className="font-mono text-sm text-ink font-bold">7049205128</span>
            </p>
            <p className="mt-1 text-smoke">
              Please share the payment receipt on WhatsApp at <strong>8319623253</strong> to lock your slot.
            </p>
            <p className="mt-1 text-smoke">
              📞 Consultation is conducted 1:1 via voice call directly with Dr. Arwa Bohra.
            </p>
            <p className="mt-2 text-smoke border-t border-line/60 pt-2">{settings.cancellationPolicy}</p>
          </div>
        </section>
      )}

      {/* ---------------- sticky nav ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          {step > 1 && (
            <button onClick={() => go(step - 1)} className="btn-outline">
              Back
            </button>
          )}
          {step < 7 ? (
            <button onClick={next} className="btn-primary flex-1">
              Continue
            </button>
          ) : (
            <button
              onClick={confirmBooking}
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {submitting ? "Confirming…" : `Confirm booking · ${formatINR(fee)}`}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function WaitlistCard({
  mode,
  date,
  whatsapp,
  reason,
}: {
  mode: ConsultMode;
  date: string;
  whatsapp: string;
  reason: string;
}) {
  const text = `Hi, I'd like to join the waitlist for a ${modeLabel(mode)} on ${formatDateLabel(date)} with Dr. Arwa Bohra.`;
  return (
    <div className="rounded-2xl border border-line bg-white p-4 text-center shadow-card">
      <p className="text-sm font-semibold text-ink">{reason}</p>
      <p className="mt-1 text-xs text-smoke">
        Slots sometimes free up. Join the WhatsApp waitlist and we&rsquo;ll
        message you if one opens.
      </p>
      <a
        href={waLink(whatsapp, text)}
        target="_blank"
        rel="noreferrer"
        className="btn-outline mt-3 w-full"
      >
        Join WhatsApp waitlist
      </a>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-2 ${last ? "" : "border-b border-line/70"}`}>
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-smoke">
        {k}
      </span>
      <span className="text-right text-sm font-medium text-ink">{v}</span>
    </div>
  );
}
