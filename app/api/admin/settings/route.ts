import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/data";
import { sanitizeSettings } from "@/lib/validation";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeSettings(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  saveSettings(sanitized.value);

  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/treatments");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/faq");

  return NextResponse.json({ ok: true, settings: sanitized.value });
}
