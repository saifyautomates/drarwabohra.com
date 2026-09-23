/* ------------------------------------------------------------------ */
/* Slot engine — server-safe, pure functions. No imports of lib/data    */
/* (it touches node:fs) so these helpers can also run in route handlers */
/* without surprises. All times are "HH:MM" 24h strings; dates are     */
/* YYYY-MM-DD strings interpreted in Asia/Kolkata (IST) — "now" and    */
/* "today" are pinned to IST so UTC-hosted servers don't drift 5.5h.    */
/* ------------------------------------------------------------------ */

import type {
  Booking,
  ConsultMode,
  Schedule,
  WeekDay,
} from "@/lib/data";

/** Current time in Asia/Kolkata. The returned Date's local getters
 *  (getHours/getMinutes/getFullYear/…) reflect IST wall-clock time, so all
 *  slot math stays correct on UTC hosts (e.g. Vercel). */
export function nowIST(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isPastDate(iso: string): boolean {
  return iso < toISODate(nowIST());
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function dayOfWeek(iso: string): WeekDay {
  const [y, m, d] = iso.split("-").map(Number);
  return String(new Date(y, m - 1, d).getDay()) as WeekDay;
}

/**
 * All slots for one day + consult mode. Returns [] when the day is closed
 * for that mode, blocked, invalid, or in the past. For today, slots that
 * have already started are excluded. Booked (non-cancelled) slots are
 * marked unavailable.
 */
export function generateSlots(
  dateISO: string,
  schedule: Schedule,
  bookings: Booking[],
  mode: ConsultMode
): { time: string; available: boolean }[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return [];
  if (isPastDate(dateISO)) return [];
  if (schedule.blockedDates.includes(dateISO)) return [];

  const window = schedule.hours[dayOfWeek(dateISO)]?.[mode];
  if (!window) return [];

  const step = schedule.slotDurationMin > 0 ? schedule.slotDurationMin : 20;
  const startMin = toMinutes(window.start);
  const endMin = toMinutes(window.end);
  if (!(startMin < endMin)) return [];

  const taken = new Set(
    bookings
      .filter(
        (b) =>
          b.date === dateISO &&
          b.mode === mode &&
          b.status !== "cancelled"
      )
      .map((b) => b.time)
  );

  const isToday = dateISO === toISODate(nowIST());
  const istNow = nowIST();
  const nowMin = istNow.getHours() * 60 + istNow.getMinutes();

  const slots: { time: string; available: boolean }[] = [];
  for (let min = startMin; min + step <= endMin; min += step) {
    if (isToday && min <= nowMin) continue;
    const time = fromMinutes(min);
    slots.push({ time, available: !taken.has(time) });
  }
  return slots;
}

export interface NextAvailable {
  date: string;
  time: string;
  mode: ConsultMode;
}

/**
 * Scan the next 14 days for the earliest available slot. When `mode` is
 * omitted, all modes are considered and the earliest calendar slot wins.
 */
export function getNextAvailable(
  fromDate: Date,
  schedule: Schedule,
  bookings: Booking[],
  mode?: ConsultMode
): NextAvailable | null {
  const modes: ConsultMode[] = mode
    ? [mode]
    : ["in-clinic", "video", "audio"];

  let best: NextAvailable | null = null;

  for (let i = 0; i < 14; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    const iso = toISODate(d);

    for (const m of modes) {
      const slots = generateSlots(iso, schedule, bookings, m);
      const open = slots.find((s) => s.available);
      if (!open) continue;
      const candidate: NextAvailable = { date: iso, time: open.time, mode: m };
      if (
        !best ||
        candidate.date < best.date ||
        (candidate.date === best.date && candidate.time < best.time)
      ) {
        best = candidate;
      }
    }

    // The earliest possible slot on day `i` is found; any later day can only
    // be later, so we can stop once day `i` produced a candidate.
    if (best && best.date === iso) return best;
  }
  return best;
}

/** "2026-09-22" -> "Mon, 22 Sep" */
export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${days[dt.getDay()]}, ${d} ${months[dt.getMonth()]}`;
}

/** "18:30" -> "6:30 PM" */
export function formatTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}
