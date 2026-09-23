/* Client-safe helpers shared by the booking wizard and my-booking page.
   (lib/data-client.ts already covers formatINR / waLink / modeLabel —
   do NOT import @/lib/data here; it touches node:fs.) */

/** Google Calendar "add event" deep link for an appointment. */
export function googleCalendarUrl(opts: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM 24h
  durationMin: number;
  details: string;
  location: string;
}): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = new Date(`${opts.date}T${opts.time}:00`);
  const end = new Date(start.getTime() + opts.durationMin * 60_000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts.details,
    location: opts.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** "2026-09-22" -> Date object at local midnight. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 14 upcoming dates starting today, as YYYY-MM-DD strings. */
export function next14Days(): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`
    );
  }
  return out;
}

/** Group slot times into Morning (<12), Afternoon (12–17), Evening (17+). */
export function groupSlots(slots: { time: string; available: boolean }[]) {
  const groups: { label: string; slots: typeof slots }[] = [
    { label: "Morning", slots: [] },
    { label: "Afternoon", slots: [] },
    { label: "Evening", slots: [] },
  ];
  for (const s of slots) {
    const h = Number(s.time.split(":")[0]);
    if (h < 12) groups[0].slots.push(s);
    else if (h < 17) groups[1].slots.push(s);
    else groups[2].slots.push(s);
  }
  return groups.filter((g) => g.slots.length > 0);
}

/** WhatsApp prefilled message for the booking-confirmation handoff. */
export function bookingWhatsAppText(
  id: string,
  modeLabelText: string,
  dateLabel: string,
  timeLabel: string,
  patientName: string
): string {
  return (
    `Hi, I booked an appointment with Dr. Arwa Bohra.\n` +
    `Booking ID: ${id}\n` +
    `Mode: ${modeLabelText}\n` +
    `Slot: ${dateLabel}, ${timeLabel}\n` +
    `Patient: ${patientName}`
  );
}
