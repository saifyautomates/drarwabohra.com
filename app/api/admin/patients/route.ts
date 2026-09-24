import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPatientRecords, addPatientRecord, type PatientRecord } from "@/lib/data";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ patients: getPatientRecords() });
}

export async function POST(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const data = parsed.body as Partial<PatientRecord>;
  if (!data.name || !data.mobile) {
    return NextResponse.json(
      { error: "Patient name and mobile number are required." },
      { status: 400 }
    );
  }

  const newPatient = addPatientRecord({
    name: String(data.name).trim(),
    mobile: String(data.mobile).trim(),
    email: data.email ? String(data.email).trim() : undefined,
    age: data.age ? Number(data.age) : undefined,
    gender: data.gender ? String(data.gender).trim() : undefined,
    city: data.city ? String(data.city).trim() : undefined,
    chiefComplaint: data.chiefComplaint ? String(data.chiefComplaint).trim() : undefined,
    medicalHistory: data.medicalHistory ? String(data.medicalHistory).trim() : undefined,
    currentRemedies: data.currentRemedies ? String(data.currentRemedies).trim() : undefined,
    notes: data.notes ? String(data.notes).trim() : undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
  });

  revalidatePath("/admin/patients");

  return NextResponse.json({ ok: true, patient: newPatient }, { status: 201 });
}
