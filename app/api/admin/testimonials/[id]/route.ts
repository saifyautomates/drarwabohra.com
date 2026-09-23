import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTestimonials, saveTestimonials } from "@/lib/data";
import { sanitizeTestimonial } from "@/lib/validation";
import { deny, readBody } from "../../_guard";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeTestimonial(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const list = getTestimonials();
  const idx = list.findIndex((t) => t.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }

  const updated = { ...list[idx], ...sanitized.value };
  list[idx] = updated;
  saveTestimonials(list);

  revalidatePath("/");
  revalidatePath("/treatments");

  return NextResponse.json({ ok: true, testimonial: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const list = getTestimonials();
  if (!list.some((t) => t.id === params.id)) {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }

  saveTestimonials(list.filter((t) => t.id !== params.id));

  revalidatePath("/");
  revalidatePath("/treatments");

  return NextResponse.json({ ok: true });
}
