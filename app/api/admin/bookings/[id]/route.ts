import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getBookings,
  getSchedule,
  updateBooking,
  type Booking,
} from "@/lib/data";
import { sanitizeBookingPatch } from "@/lib/validation";
import { generateSlots } from "@/lib/slots";
import { deny, readBody } from "../../_guard";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const existing = getBookings().find((b) => b.id === params.id);
  if (!existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeBookingPatch(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const patch: Partial<Booking> = {};
  if (sanitized.value.status) patch.status = sanitized.value.status;

  if (sanitized.value.reschedule) {
    const { mode, date, time } = sanitized.value.reschedule;
    // Check availability against all bookings except this one
    // (its current slot frees up when moved).
    const others = getBookings().filter((b) => b.id !== existing.id);
    const target = generateSlots(date, getSchedule(), others, mode).find(
      (s) => s.time === time
    );
    if (!target || !target.available) {
      return NextResponse.json(
        { error: "That slot is not available anymore." },
        { status: 409 }
      );
    }
    patch.mode = mode;
    patch.date = date;
    patch.time = time;
  }

  const updated = updateBooking(existing.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/admin");
  revalidatePath("/admin/appointments");

  return NextResponse.json({ ok: true, booking: updated });
}
