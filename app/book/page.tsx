import type { Metadata } from "next";
import { getBookings, getSchedule, getSettings, type ConsultMode } from "@/lib/data";
import { getNextAvailable, nowIST } from "@/lib/slots";
import { BookHeader, BookFooter } from "@/components/book/chrome";
import Wizard, { type NextSlot, type WizardSettings } from "./wizard";

export const metadata: Metadata = {
  title: "Book E-Consultation — Dr. Arwa Bohra",
  description:
    "Book an online voice call or video consultation with Dr. Arwa Bohra, Homeopathic Consultant & Skin and Hair Expert.",
};

const MODES: ConsultMode[] = ["audio", "video"];

const KNOWN_REASONS = [
  "Acne & Pimples",
  "Pigmentation",
  "Hairfall",
  "Dandruff",
  "Eczema",
  "Skin Glow",
  "Follow-up visit",
  "Other",
];

export default function BookPage({
  searchParams,
}: {
  searchParams: { mode?: string; reason?: string };
}) {
  const settings = getSettings();
  const schedule = getSchedule();
  const bookings = getBookings();
  const now = nowIST();

  const nextByMode = Object.fromEntries(
    MODES.map((m) => {
      const next = getNextAvailable(now, schedule, bookings, m);
      const slot: NextSlot | null = next
        ? { date: next.date, time: next.time }
        : null;
      return [m, slot];
    })
  ) as Record<ConsultMode, NextSlot | null>;

  const wizardSettings: WizardSettings = {
    doctorName: settings.doctorName,
    doctorTitle: settings.doctorTitle,
    fees: settings.fees,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    address: settings.address,
    mapsLink: settings.mapsLink,
    cancellationPolicy: settings.cancellationPolicy,
    paymentMode: settings.paymentMode,
    slotDurationMin: settings.slotDurationMin,
  };

  const initialMode = MODES.includes(searchParams.mode as ConsultMode)
    ? (searchParams.mode as ConsultMode)
    : null;

  const initialReason = searchParams.reason
    ? (KNOWN_REASONS.find(
        (r) => r.toLowerCase() === searchParams.reason!.toLowerCase()
      ) ?? null)
    : null;

  return (
    <>
      <BookHeader title="Book appointment" />
      <Wizard
        settings={wizardSettings}
        initialMode={initialMode}
        initialReason={initialReason}
        nextByMode={nextByMode}
      />
      <BookFooter phone={settings.phone} />
    </>
  );
}
