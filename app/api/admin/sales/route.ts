import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProductSales, addProductSale, type ProductSale } from "@/lib/data";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ sales: getProductSales() });
}

export async function POST(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const data = parsed.body as Partial<ProductSale>;
  if (!data.customerName || !data.productTitle || !data.totalAmount) {
    return NextResponse.json(
      { error: "Customer name, product title and amount are required." },
      { status: 400 }
    );
  }

  const newSale = addProductSale({
    customerName: String(data.customerName).trim(),
    customerPhone: String(data.customerPhone || "").trim(),
    customerCity: String(data.customerCity || "").trim(),
    productId: String(data.productId || "custom"),
    productTitle: String(data.productTitle).trim(),
    quantity: Number(data.quantity) || 1,
    unitPrice: Number(data.unitPrice) || Number(data.totalAmount),
    totalAmount: Number(data.totalAmount) || 0,
    paymentStatus: data.paymentStatus || "paid",
    paymentMethod: data.paymentMethod || "upi",
    deliveryStatus: data.deliveryStatus || "processing",
    courierName: String(data.courierName || "").trim(),
    trackingNumber: String(data.trackingNumber || "").trim(),
    notes: String(data.notes || "").trim(),
    date: data.date,
  });

  revalidatePath("/admin");

  return NextResponse.json({ ok: true, sale: newSale }, { status: 201 });
}
