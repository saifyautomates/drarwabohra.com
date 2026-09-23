import { NextResponse } from "next/server";
import {
  getBookingByToken,
  getBookings,
  getSchedule,
  updateBooking,
} from "@/lib/data";
import { generateSlots, nowIST, toISODate } from "@/lib/slots";

/* Rescheduling is free until 4 hours before the appointment. */
const RESCHEDULE_CUTOFF_MS = 4 * 60 * 60 * 1000;

interface Params {
  params: { token: string };
}

/**
 * POST /api/my-booking/[token]/reschedule  { date, time }
 * Moves the booking to a new slot. Rejected when the current appointment
 * is less than 4 hours away, or when the new slot is no longer free.
 */
export async function POST(req: Request, { params }: Params) {
  const booking = getBookingByToken(params.token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "This appointment is already cancelled." },
      { status: 400 }
    );
  }
  if (booking.status === "visited" || booking.status === "no-show") {
    return NextResponse.json(
      { error: "This appointment can no longer be rescheduled." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const date = String(body?.date ?? "");
  const time = String(body?.time ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json(
      { error: "Invalid date or time." },
      { status: 400 }
    );
  }
  if (date < toISODate(nowIST())) {
    return NextResponse.json(
      { error: "The new date cannot be in the past." },
      { status: 400 }
    );
  }

  // Parse as IST explicitly (+05:30) so the cutoff is correct on
  // UTC-hosted servers, and compare against IST "now".
  const currentStart = new Date(
    `${booking.date}T${booking.time}:00+05:30`
  ).getTime();
  if (currentStart - nowIST().getTime() < RESCHEDULE_CUTOFF_MS) {
    return NextResponse.json(
      {
        error:
          "Rescheduling is allowed until 4 hours before your appointment. Please call or WhatsApp the clinic for help.",
      },
      { status: 400 }
    );
  }

  // Check availability excluding this booking's own current slot.
  const others = getBookings().filter((b) => b.id !== booking.id);
  const slot = generateSlots(date, getSchedule(), others, booking.mode).find(
    (s) => s.time === time
  );
  if (!slot || !slot.available) {
    return NextResponse.json(
      { error: "This slot was just taken. Please choose another slot." },
      { status: 409 }
    );
  }

  const updated = updateBooking(booking.id, { date, time });
  return NextResponse.json({ ok: true, booking: updated });
}
