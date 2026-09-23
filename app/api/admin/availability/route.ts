import { NextResponse } from "next/server";
import { getBookings, getSchedule, type ConsultMode } from "@/lib/data";
import { generateSlots } from "@/lib/slots";
import { deny } from "../_guard";

/**
 * GET /api/admin/availability?date=YYYY-MM-DD&mode=in-clinic
 * Open slot times for a given day and consult mode. Powers the admin
 * reschedule picker (public booking UI will use the Phase B public route).
 */
export async function GET(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? "";
  const mode = (url.searchParams.get("mode") ?? "") as ConsultMode;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }
  if (!["in-clinic", "video", "audio"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
  }

  const slots = generateSlots(date, getSchedule(), getBookings(), mode);
  return NextResponse.json({
    date,
    mode,
    slots: slots.map((s) => ({ time: s.time, available: s.available })),
  });
}
