import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updatePatientRecord, deletePatientRecord, type PatientRecord } from "@/lib/data";
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
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const success = deletePatientRecord(params.id);
  if (!success) {
    return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
  }

  revalidatePath("/admin/patients");
  return NextResponse.json({ ok: true });
}
