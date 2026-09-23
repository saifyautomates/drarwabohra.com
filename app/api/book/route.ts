import { NextResponse } from "next/server";
import {
  addBooking,
  consumeOtpNonce,
  getBookings,
  getSchedule,
  type Booking,
  type ConsultMode,
} from "@/lib/data";
import { generateSlots, nowIST, toISODate } from "@/lib/slots";

const MODES: ConsultMode[] = ["in-clinic", "video", "audio"];
const GENDERS = ["Female", "Male", "Other"];

interface BookBody {
  mode?: unknown;
  reasons?: unknown;
  date?: unknown;
  time?: unknown;
  name?: unknown;
  age?: unknown;
  gender?: unknown;
  forSelf?: unknown;
  relation?: unknown;
  mobile?: unknown;
  complaint?: unknown;
  medicines?: unknown;
  otpNonce?: unknown;
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * POST /api/book — creates a booking. Requires a single-use `otpNonce`
 * minted by POST /api/otp/verify for the same mobile number; the nonce is
 * consumed (deleted) here, so it cannot be reused. Slot availability is
 * re-checked so two simultaneous bookings cannot take the same slot.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as BookBody | null;
  if (!body || typeof body !== "object") return bad("Invalid request body.");

  const mode = body.mode;
  if (mode !== "in-clinic" && mode !== "video" && mode !== "audio") {
    return bad("Choose a consultation mode: in-clinic, video or audio.");
  }

  const reasons = Array.isArray(body.reasons)
    ? body.reasons
        .map((r) => String(r).trim())
        .filter((r) => r.length > 0 && r.length <= 50)
        .slice(0, 4)
    : [];
  if (reasons.length === 0) return bad("Choose at least one concern.");

  const date = String(body.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad("Invalid date.");
  if (date < toISODate(nowIST())) return bad("The date cannot be in the past.");

  const time = String(body.time ?? "");
  if (!/^\d{2}:\d{2}$/.test(time)) return bad("Invalid time slot.");

  const name = String(body.name ?? "").trim();
  if (name.length < 2 || name.length > 80) {
    return bad("Enter the patient's full name.");
  }

  const age = Number(body.age);
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return bad("Enter a valid age (0–120).");
  }

  const gender = String(body.gender ?? "");
  if (!GENDERS.includes(gender)) return bad("Select a gender.");

  const forSelf = body.forSelf !== false;
  const relation = String(body.relation ?? "").trim();
  if (!forSelf && (relation.length < 2 || relation.length > 40)) {
    return bad("Mention your relation with the patient.");
  }

  const mobile = String(body.mobile ?? "").replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return bad("Enter a valid 10-digit Indian mobile number.");
  }

  const complaint = String(body.complaint ?? "").trim();
  if (complaint.length < 10 || complaint.length > 1000) {
    return bad("Describe the main complaint in a few words (min 10 characters).");
  }
  const medicines = String(body.medicines ?? "").trim().slice(0, 500) || undefined;

  // The mobile must have been verified via OTP: the nonce minted by
  // POST /api/otp/verify must be presented and is consumed single-use.
  const otpNonce = String(body.otpNonce ?? "");
  if (!otpNonce || !consumeOtpNonce(otpNonce, mobile)) {
    return NextResponse.json(
      { error: "Mobile number not verified. Please complete OTP verification." },
      { status: 401 }
    );
  }

  // Re-check the slot against live data before creating the booking.
  const schedule = getSchedule();
  const bookings = getBookings();
  const slot = generateSlots(date, schedule, bookings, mode).find(
    (s) => s.time === time
  );
  if (!slot || !slot.available) {
    return NextResponse.json(
      { error: "This slot was just taken. Please choose another slot." },
      { status: 409 }
    );
  }

  const entry = addBooking({
    mode,
    reasons,
    date,
    time,
    name,
    age,
    gender,
    forSelf,
    relation: forSelf ? undefined : relation,
    mobile,
    complaint,
    medicines,
  } satisfies Omit<Booking, "id" | "token" | "createdAt" | "status">);

  return NextResponse.json(
    { id: entry.id, token: entry.token },
    { status: 201 }
  );
}
