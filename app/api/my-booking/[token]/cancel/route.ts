import { NextResponse } from "next/server";
import { getBookingByToken, updateBooking } from "@/lib/data";

interface Params {
  params: { token: string };
}

/** POST /api/my-booking/[token]/cancel — marks the booking cancelled. */
export async function POST(_req: Request, { params }: Params) {
  const booking = getBookingByToken(params.token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true, booking });
  }
  const updated = updateBooking(booking.id, { status: "cancelled" });
  return NextResponse.json({ ok: true, booking: updated });
}
