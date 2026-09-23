import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTestimonials, saveTestimonials, type Testimonial } from "@/lib/data";
import { nextTestimonialId, sanitizeTestimonial } from "@/lib/validation";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ testimonials: getTestimonials() });
}

export async function POST(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeTestimonial(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const list = getTestimonials();
  const testimonial: Testimonial = {
    id: nextTestimonialId(list),
    ...sanitized.value,
  };
  list.push(testimonial);
  saveTestimonials(list);

  revalidatePath("/");
  revalidatePath("/treatments");

  return NextResponse.json({ ok: true, testimonial }, { status: 201 });
}
