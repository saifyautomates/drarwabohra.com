import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTreatments, saveTreatments, type Treatment } from "@/lib/data";
import {
  nextTreatmentId,
  sanitizeTreatment,
  slugify,
} from "@/lib/validation";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ treatments: getTreatments() });
}

export async function POST(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeTreatment(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const list = getTreatments();
  const id = nextTreatmentId(list);
  const treatment: Treatment = {
    id,
    slug: `${slugify(sanitized.value.title)}-${id.toLowerCase()}`,
    ...sanitized.value,
  };
  list.push(treatment);
  saveTreatments(list);

  revalidatePath("/");
  revalidatePath("/treatments");

  return NextResponse.json({ ok: true, treatment }, { status: 201 });
}
