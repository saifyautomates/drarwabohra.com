import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSchedule, saveSchedule } from "@/lib/data";
import { sanitizeSchedule } from "@/lib/validation";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ schedule: getSchedule() });
}

export async function PUT(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeSchedule(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  saveSchedule(sanitized.value);

  revalidatePath("/");
  revalidatePath("/book");

  return NextResponse.json({ ok: true, schedule: sanitized.value });
}
