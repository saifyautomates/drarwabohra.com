import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateProductSale, deleteProductSale, type ProductSale } from "@/lib/data";
import { deny, readBody } from "../../_guard";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const patch = parsed.body as Partial<ProductSale>;
  const updated = updateProductSale(params.id, patch);

  if (!updated) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  revalidatePath("/admin");
  return NextResponse.json({ ok: true, sale: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const success = deleteProductSale(params.id);
  if (!success) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
