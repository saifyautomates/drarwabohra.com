import { NextResponse } from "next/server";
import { getBookings, getSchedule, type ConsultMode } from "@/lib/data";
import { generateSlots, getNextAvailable, nowIST } from "@/lib/slots";

const MODES: ConsultMode[] = ["in-clinic", "video", "audio"];

/**
 * GET /api/availability?date=YYYY-MM-DD&mode=in-clinic|video|audio
 * Public — no auth. Returns that day's slots plus the earliest open slot
 * across the next 14 days for the same mode.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? "";
  const mode = searchParams.get("mode") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid or missing date. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }
  if (!MODES.includes(mode as ConsultMode)) {
    return NextResponse.json(
      { error: "Invalid or missing mode. Use in-clinic, video or audio." },
      { status: 400 }
    );
  }

  const m = mode as ConsultMode;
  const schedule = getSchedule();
  const bookings = getBookings();

  const slots = generateSlots(date, schedule, bookings, m);
  const nextAvailable = getNextAvailable(nowIST(), schedule, bookings, m);

  return NextResponse.json({ date, mode: m, slots, nextAvailable });
}
