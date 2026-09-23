import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, saveProducts, type Product } from "@/lib/data";
import { nextProductId, sanitizeProduct } from "@/lib/validation";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ products: getProducts() });
}

export async function POST(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeProduct(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const list = getProducts();
  const product: Product = {
    id: nextProductId(list),
    createdAt: new Date().toISOString(),
    ...sanitized.value,
  };
  list.push(product);
  saveProducts(list);

  revalidatePath("/");
  revalidatePath("/products");

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
