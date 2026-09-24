/**
 * Client-Side Persistence Layer for Dr. Arwa Bohra Admin Console
 *
 * Ensures that record deletions, status updates, and modifications persist
 * reliably across page refreshes (F5) even on serverless hosting (e.g. Vercel)
 * where the filesystem is ephemeral/read-only.
 */

const STORAGE_KEYS = {
  DELETED_BOOKINGS: "dr_arwa_deleted_booking_ids_v2",
  DELETED_PATIENTS: "dr_arwa_deleted_patient_keys_v2",
  DELETED_SALES: "dr_arwa_deleted_sale_ids_v2",
  BOOKING_OVERRIDES: "dr_arwa_booking_overrides_v2",
  SALES_OVERRIDES: "dr_arwa_sales_overrides_v2",
};

export function getDeletedBookingIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_BOOKINGS);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function saveDeletedBookingId(id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const current = getDeletedBookingIds();
    current.add(id);
    localStorage.setItem(
      STORAGE_KEYS.DELETED_BOOKINGS,
      JSON.stringify(Array.from(current))
    );
  } catch {}
}

export function getDeletedPatientKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_PATIENTS);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function saveDeletedPatientKey(key: string) {
  if (typeof window === "undefined" || !key) return;
  try {
    const current = getDeletedPatientKeys();
    current.add(key);
    localStorage.setItem(
      STORAGE_KEYS.DELETED_PATIENTS,
      JSON.stringify(Array.from(current))
    );
  } catch {}
}

export function getDeletedSaleIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_SALES);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function saveDeletedSaleId(id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const current = getDeletedSaleIds();
    current.add(id);
    localStorage.setItem(
      STORAGE_KEYS.DELETED_SALES,
      JSON.stringify(Array.from(current))
    );
  } catch {}
}

export function getBookingOverrides(): Record<string, Record<string, unknown>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKING_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveBookingOverride(id: string, patch: Record<string, unknown>) {
  if (typeof window === "undefined" || !id) return;
  try {
    const current = getBookingOverrides();
    current[id] = { ...(current[id] || {}), ...patch };
    localStorage.setItem(
      STORAGE_KEYS.BOOKING_OVERRIDES,
      JSON.stringify(current)
    );
  } catch {}
}
