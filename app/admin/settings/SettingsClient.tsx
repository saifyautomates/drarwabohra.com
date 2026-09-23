"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/data";
import { formatINR } from "@/lib/data-client";
import {
  ErrorNote,
  Field,
  SavedNote,
  useSaveForm,
} from "@/components/admin/ui";

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initialSettings);
  const { saving, error, saved, save } = useSaveForm<Settings>(
    "/api/admin/settings",
    "PUT"
  );

  const set = (patch: Partial<Settings>) => setS((prev) => ({ ...prev, ...patch }));
  const setFee = (key: keyof Settings["fees"], value: number) =>
    setS((prev) => ({
      ...prev,
      fees: { ...prev.fees, [key]: Math.max(0, value || 0) },
    }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await save(s);
    if (result) {
      setS(result);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Clinic identity */}
      <section className="card space-y-4 p-5 sm:p-6">
        <SectionTitle>Clinic identity</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Clinic name">
            <input
              className="input"
              value={s.clinicName}
              onChange={(e) => set({ clinicName: e.target.value })}
            />
          </Field>
          <Field label="Doctor name">
            <input
              className="input"
              value={s.doctorName}
              onChange={(e) => set({ doctorName: e.target.value })}
            />
          </Field>
          <Field label="Doctor title">
            <input
              className="input"
              value={s.doctorTitle}
              onChange={(e) => set({ doctorTitle: e.target.value })}
              placeholder="Homeopathic Consultant · Skin & Hair Expert"
            />
          </Field>
          <Field label="Tagline">
            <input
              className="input"
              value={s.tagline}
              onChange={(e) => set({ tagline: e.target.value })}
            />
          </Field>
        </div>
      </section>

      {/* Contact */}
      <section className="card space-y-4 p-5 sm:p-6">
        <SectionTitle>Contact</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Phone (10 digits)"
            hint="Editable placeholder — replace with the clinic's real number."
          >
            <input
              className="input"
              value={s.phone}
              onChange={(e) =>
                set({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              inputMode="numeric"
              placeholder="9999999999"
            />
          </Field>
          <Field
            label="WhatsApp number (with country code, no +)"
            hint="Editable placeholder — replace with the clinic's real number."
          >
            <input
              className="input"
              value={s.whatsapp}
              onChange={(e) =>
                set({ whatsapp: e.target.value.replace(/\D/g, "").slice(0, 13) })
              }
              inputMode="numeric"
              placeholder="919999999999"
            />
          </Field>
          <Field label="Clinic address" hint="Keep it simple: area + city is enough.">
            <input
              className="input"
              value={s.address}
              onChange={(e) => set({ address: e.target.value })}
            />
          </Field>
          <Field label="Google Maps link" hint="Share link from Google Maps.">
            <input
              className="input"
              value={s.mapsLink}
              onChange={(e) => set({ mapsLink: e.target.value.trim() })}
              placeholder="https://maps.google.com/…"
            />
          </Field>
          <Field label="Instagram">
            <input
              className="input"
              value={s.instagram}
              onChange={(e) => set({ instagram: e.target.value.trim() })}
              placeholder="https://instagram.com/…"
            />
          </Field>
          <Field label="YouTube">
            <input
              className="input"
              value={s.youtube}
              onChange={(e) => set({ youtube: e.target.value.trim() })}
              placeholder="https://youtube.com/…"
            />
          </Field>
          <Field
            label="Medical registration number"
            hint="Leave blank until the clinic provides it. The website will show “to be updated by clinic”."
          >
            <input
              className="input"
              value={s.registration}
              onChange={(e) => set({ registration: e.target.value.trim() })}
              placeholder="to be updated by clinic"
            />
          </Field>
        </div>
      </section>

      {/* Fees */}
      <section className="card space-y-4 p-5 sm:p-6">
        <SectionTitle>Consultation fees</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["in-clinic", "In-clinic visit"],
              ["video", "Video consult"],
              ["audio", "Audio call"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label} hint={formatINR(s.fees[key])}>
              <input
                type="number"
                min={0}
                step={50}
                className="input"
                value={s.fees[key]}
                onChange={(e) => setFee(key, parseInt(e.target.value, 10))}
              />
            </Field>
          ))}
        </div>
      </section>

      {/* Home page copy */}
      <section className="card space-y-4 p-5 sm:p-6">
        <SectionTitle>Home page copy</SectionTitle>
        <Field label="Hero headline">
          <input
            className="input"
            value={s.heroHeadline}
            onChange={(e) => set({ heroHeadline: e.target.value })}
          />
        </Field>
        <Field label="Hero subline">
          <textarea
            className="input"
            rows={2}
            value={s.heroSubline}
            onChange={(e) => set({ heroSubline: e.target.value })}
          />
        </Field>
        <Field label="About (short)" hint="Two honest sentences. No invented credentials or patient counts.">
          <textarea
            className="input"
            rows={4}
            value={s.aboutShort}
            onChange={(e) => set({ aboutShort: e.target.value })}
          />
        </Field>
      </section>

      {/* Policies */}
      <section className="card space-y-4 p-5 sm:p-6">
        <SectionTitle>Policies</SectionTitle>
        <Field label="Cancellation policy">
          <textarea
            className="input"
            rows={2}
            value={s.cancellationPolicy}
            onChange={(e) => set({ cancellationPolicy: e.target.value })}
          />
        </Field>
        <Field label="Payment mode">
          <select
            className="input max-w-sm"
            value={s.paymentMode}
            onChange={(e) =>
              set({ paymentMode: e.target.value as Settings["paymentMode"] })
            }
          >
            <option value="pay-at-clinic">
              Pay at clinic / pay later (no online payment)
            </option>
            <option value="advance-token">
              Advance token payment (requires payment gateway)
            </option>
          </select>
        </Field>
      </section>

      {/* Integrations */}
      <section className="card space-y-4 p-5 sm:p-6">
        <SectionTitle>Integrations</SectionTitle>
        <p className="text-xs text-smoke">
          These are placeholders for the clinic&rsquo;s accounts. Nothing here
          is live until real keys are entered.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="OTP mode"
            hint="“Demo” shows a demo code on screen. “MSG91” sends a real SMS once the key below is filled."
          >
            <select
              className="input"
              value={s.otpMode}
              onChange={(e) =>
                set({ otpMode: e.target.value as Settings["otpMode"] })
              }
            >
              <option value="demo">Demo (not live)</option>
              <option value="msg91">MSG91 (not live)</option>
            </select>
          </Field>
          <Field label="MSG91 API key" hint="Integration point — not live.">
            <input
              className="input"
              type="password"
              autoComplete="off"
              value={s.msg91Key}
              onChange={(e) => set({ msg91Key: e.target.value.trim() })}
              placeholder="Leave blank until connected"
            />
          </Field>
          <Field label="Razorpay / UPI key" hint="Integration point — not live.">
            <input
              className="input"
              type="password"
              autoComplete="off"
              value={s.razorpayKey}
              onChange={(e) => set({ razorpayKey: e.target.value.trim() })}
              placeholder="Leave blank until connected"
            />
          </Field>
          <Field label="Slot duration (minutes)" hint="Also editable on the Schedule page.">
            <input
              type="number"
              min={5}
              max={120}
              className="input max-w-[160px]"
              value={s.slotDurationMin}
              onChange={(e) =>
                set({ slotDurationMin: parseInt(e.target.value, 10) || 20 })
              }
            />
          </Field>
        </div>
      </section>

      <div className="space-y-3">
        <ErrorNote error={error} />
        <SavedNote saved={saved} />
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-lg text-ink">
      {children}
      <span className="rule-gold mt-2 block" />
    </h2>
  );
}
