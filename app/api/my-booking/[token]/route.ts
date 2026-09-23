import { NextResponse } from "next/server";
import { getBookingByToken } from "@/lib/data";

interface Params {
  params: { token: string };
}

/**
 * GET /api/my-booking/[token] — public booking lookup.
 * The token is an unguessable random string issued at booking time; it is
 * the only credential needed to manage the booking.
 */
export async function GET(_req: Request, { params }: Params) {
  const booking = getBookingByToken(params.token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
