import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, saveProducts } from "@/lib/data";
import { sanitizeProduct } from "@/lib/validation";
import { deny, readBody } from "../../_guard";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeProduct(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const list = getProducts();
  const idx = list.findIndex((p) => p.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const updated = {
    ...list[idx],
    ...sanitized.value,
    id: list[idx].id,
    createdAt: list[idx].createdAt,
  };
  list[idx] = updated;
  saveProducts(list);

  revalidatePath("/");
  revalidatePath("/products");

  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const list = getProducts();
  if (!list.some((p) => p.id === params.id)) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  saveProducts(list.filter((p) => p.id !== params.id));

  revalidatePath("/");
  revalidatePath("/products");

  return NextResponse.json({ ok: true });
}
