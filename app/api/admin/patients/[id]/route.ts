import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  updatePatientRecord,
  deletePatientRecord,
  getBookings,
  saveBookings,
  getProductSales,
  saveProductSales,
  type PatientRecord,
} from "@/lib/data";
import { deny, readBody } from "../../_guard";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const patch = parsed.body as Partial<PatientRecord>;
  const updated = updatePatientRecord(params.id, patch);

  if (!updated) {
    return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
  }

  revalidatePath("/admin/patients");
  return NextResponse.json({ ok: true, patient: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const url = new URL(req.url);
  const mobile = url.searchParams.get("mobile");

  // 1. Delete from patients.json
  if (params.id && params.id !== "direct" && params.id !== "undefined" && params.id !== "null") {
    deletePatientRecord(params.id);
  }

  // 2. If mobile is provided, clean up any bookings and product sales associated with this patient
  if (mobile) {
    const norm = mobile.replace(/\D/g, "");
    if (norm.length >= 7) {
      const allBookings = getBookings();
      const filteredBookings = allBookings.filter(
        (b) => b.mobile.replace(/\D/g, "") !== norm && !b.mobile.includes(norm)
      );
      if (filteredBookings.length !== allBookings.length) {
        saveBookings(filteredBookings);
      }

      const allSales = getProductSales();
      const filteredSales = allSales.filter(
        (s) => s.customerPhone.replace(/\D/g, "") !== norm && !s.customerPhone.includes(norm)
      );
      if (filteredSales.length !== allSales.length) {
        saveProductSales(filteredSales);
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/patients");
  revalidatePath("/admin/appointments");

  return NextResponse.json({ ok: true });
}
