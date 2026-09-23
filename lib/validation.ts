/* ------------------------------------------------------------------ */
/* Server-side input sanitizers for the admin API routes.              */
/* Reject malformed input with a 400 and a plain-language error.       */
/* ------------------------------------------------------------------ */

import type {
  Booking,
  BookingStatus,
  ConsultMode,
  Product,
  ProductCategory,
  Schedule,
  Settings,
  Testimonial,
  Treatment,
  Video,
  VideoType,
  WeekDay,
} from "@/lib/data";
import { nowIST, toISODate } from "@/lib/slots";
import { parseVideoUrl } from "@/lib/data-client";

export interface Parsed<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

function ok<T>(value: T): Parsed<T> {
  return { ok: true, value };
}

function fail<T>(error: string): Parsed<T> {
  return { ok: false, error };
}

function str(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function digits(v: unknown, maxLen: number): string {
  return typeof v === "string" ? v.replace(/\D/g, "").slice(0, maxLen) : "";
}

/* ------------------------------------------------------------------ */

export function sanitizeSettings(body: unknown): Parsed<Settings> {
  if (typeof body !== "object" || body === null) return fail("Invalid body.");
  const b = body as Record<string, unknown>;

  const fees = (b.fees ?? {}) as Record<string, unknown>;
  const feeOf = (k: string): number => Math.max(0, Math.round(num(fees[k], 0)));
  const slotDurationMin = Math.min(120, Math.max(5, Math.round(num(b.slotDurationMin, 20))));

  const otpMode = b.otpMode === "msg91" ? "msg91" : "demo";
  const paymentMode =
    b.paymentMode === "advance-token" ? "advance-token" : "pay-at-clinic";

  const value: Settings = {
    clinicName: str(b.clinicName, 80) || "Dr. Arwa Bohra's Clinic",
    doctorName: str(b.doctorName, 80) || "Dr. Arwa Bohra",
    doctorTitle: str(b.doctorTitle, 120),
    tagline: str(b.tagline, 200),
    phone: digits(b.phone, 10),
    whatsapp: digits(b.whatsapp, 13),
    address: str(b.address, 200),
    mapsLink: str(b.mapsLink, 500),
    instagram: str(b.instagram, 200),
    youtube: str(b.youtube, 200),
    registration: str(b.registration, 80),
    fees: {
      "in-clinic": feeOf("in-clinic"),
      video: feeOf("video"),
      audio: feeOf("audio"),
    },
    slotDurationMin,
    cancellationPolicy: str(b.cancellationPolicy, 500),
    otpMode,
    msg91Key: str(b.msg91Key, 200),
    razorpayKey: str(b.razorpayKey, 200),
    paymentMode,
    heroHeadline: str(b.heroHeadline, 200),
    heroSubline: str(b.heroSubline, 400),
    aboutShort: str(b.aboutShort, 1000),
  };
  return ok(value);
}

/* ------------------------------------------------------------------ */

const WEEKDAYS: WeekDay[] = ["0", "1", "2", "3", "4", "5", "6"];
const MODES: ConsultMode[] = ["in-clinic", "video", "audio"];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function sanitizeWindow(v: unknown): { start: string; end: string } | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "object" || v === null) return null;
  const w = v as Record<string, unknown>;
  const start = str(w.start, 5);
  const end = str(w.end, 5);
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) return null;
  if (start >= end) return null;
  return { start, end };
}

export function sanitizeSchedule(body: unknown): Parsed<Schedule> {
  if (typeof body !== "object" || body === null) return fail("Invalid body.");
  const b = body as Record<string, unknown>;
  const hoursRaw = (b.hours ?? {}) as Record<string, unknown>;

  const hours = {} as Schedule["hours"];
  for (const wd of WEEKDAYS) {
    const dayRaw = (hoursRaw[wd] ?? {}) as Record<string, unknown>;
    const day = {} as Record<ConsultMode, { start: string; end: string } | null>;
    for (const m of MODES) day[m] = sanitizeWindow(dayRaw[m]);
    hours[wd] = day;
  }

  const blockedRaw = b.blockedDates;
  const blockedDates: string[] = Array.isArray(blockedRaw)
    ? blockedRaw
        .filter((d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort()
    : [];

  const slotDurationMin = Math.min(120, Math.max(5, Math.round(num(b.slotDurationMin, 20))));

  return ok({ hours, slotDurationMin, blockedDates });
}

/* ------------------------------------------------------------------ */

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "treatment"
  );
}

export function sanitizeTreatment(
  body: unknown
): Parsed<{ title: string; desc: string; sort: number }> {
  if (typeof body !== "object" || body === null) return fail("Invalid body.");
  const b = body as Record<string, unknown>;
  const title = str(b.title, 80);
  if (!title) return fail("Title is required.");
  return ok({
    title,
    desc: str(b.desc, 500),
    sort: Math.max(0, Math.round(num(b.sort, 0))),
  });
}

export { slugify };

export function nextTreatmentId(list: Treatment[]): string {
  let max = 0;
  for (const t of list) {
    const m = /^TRT-(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `TRT-${String(max + 1).padStart(3, "0")}`;
}

/* ------------------------------------------------------------------ */

export function sanitizeTestimonial(
  body: unknown
): Parsed<{ name: string; treatment: string; text: string; sample: boolean; sort: number }> {
  if (typeof body !== "object" || body === null) return fail("Invalid body.");
  const b = body as Record<string, unknown>;
  const name = str(b.name, 60);
  const text = str(b.text, 800);
  if (!name) return fail("Name is required.");
  if (!text) return fail("Text is required.");
  return ok({
    name,
    treatment: str(b.treatment, 80),
    text,
    sample: b.sample === true,
    sort: Math.max(0, Math.round(num(b.sort, 0))),
  });
}

export function nextTestimonialId(list: Testimonial[]): string {
  let max = 0;
  for (const t of list) {
    const m = /^TST-(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `TST-${String(max + 1).padStart(3, "0")}`;
}

/* ------------------------------------------------------------------ */

export function sanitizeVideo(
  body: unknown
): Parsed<{
  title: string;
  type: VideoType;
  url: string;
  active: boolean;
  order: number;
}> {
  if (typeof body !== "object" || body === null) return fail("Invalid body.");
  const b = body as Record<string, unknown>;
  const title = str(b.title, 120);
  if (!title) return fail("Title is required.");
  const url = str(b.url, 500);
  if (!url) return fail("Video URL is required.");
  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return fail(
      "That URL is not a recognizable YouTube or Instagram video link. Use a YouTube watch / youtu.be / Shorts link, or an Instagram reel / post link."
    );
  }
  return ok({
    title,
    type: parsed.type,
    url,
    active: b.active !== false,
    order: Math.max(0, Math.round(num(b.order, 0))),
  });
}

export function nextVideoId(list: Video[]): string {
  let max = 0;
  for (const v of list) {
    const m = /^VID-(\d+)$/.exec(v.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `VID-${String(max + 1).padStart(3, "0")}`;
}

/* ------------------------------------------------------------------ */

export function sanitizeProduct(
  body: unknown
): Parsed<{
  title: string;
  slug: string;
  tagline: string;
  description: string;
  benefits: string[];
  howToUse: string;
  ingredients: string;
  price: number;
  originalPrice?: number;
  size: string;
  category: ProductCategory;
  image: string;
  inStock: boolean;
  featured: boolean;
  order: number;
}> {
  if (typeof body !== "object" || body === null) return fail("Invalid body.");
  const b = body as Record<string, unknown>;
  const title = str(b.title, 150);
  if (!title) return fail("Product title is required.");

  const rawSlug =
    str(b.slug, 120) ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const slug = rawSlug || "product";

  const tagline = str(b.tagline, 250);
  const description = str(b.description, 3000);
  if (!description) return fail("Product description is required.");

  const benefits: string[] = Array.isArray(b.benefits)
    ? (b.benefits as unknown[]).map((x) => str(x, 200)).filter(Boolean)
    : str(b.benefits, 2000)
        .split("\n")
        .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
        .filter(Boolean);

  const howToUse = str(b.howToUse, 1500);
  const ingredients = str(b.ingredients, 1500);

  const price = Math.round(num(b.price, 0));
  if (price <= 0) return fail("Enter a valid price greater than ₹0.");

  const originalPrice = b.originalPrice
    ? Math.round(num(b.originalPrice, 0))
    : undefined;
  const size = str(b.size, 50) || "Standard";

  const validCategories: ProductCategory[] = [
    "Hair Care",
    "Skin Care",
    "Homeopathy",
    "Wellness",
  ];
  const category = (
    validCategories.includes(b.category as ProductCategory)
      ? b.category
      : "Hair Care"
  ) as ProductCategory;

  const image = str(b.image, 1000000) || "/images/dr-arwa-bohra.png";

  return ok({
    title,
    slug,
    tagline,
    description,
    benefits,
    howToUse,
    ingredients,
    price,
    originalPrice:
      originalPrice && originalPrice > price ? originalPrice : undefined,
    size,
    category,
    image,
    inStock: b.inStock !== false,
    featured: b.featured !== false,
    order: Math.max(0, Math.round(num(b.order, 0))),
  });
}

export function nextProductId(list: Product[]): string {
  let max = 0;
  for (const p of list) {
    const m = /^PRD-(\d+)$/.exec(p.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `PRD-${String(max + 1).padStart(4, "0")}`;
}

/* ------------------------------------------------------------------ */

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "visited",
  "no-show",
];

export interface BookingPatch {
  status?: BookingStatus;
  reschedule?: { mode: ConsultMode; date: string; time: string };
}

/** Validate a booking-update body. Slot-availability for rescheduling is
 *  checked by the route handler, which has the full schedule + bookings. */
export function sanitizeBookingPatch(body: unknown): Parsed<BookingPatch> {
  if (typeof body !== "object" || body === null) return fail("Invalid body.");
  const b = body as Record<string, unknown>;
  const patch: BookingPatch = {};

  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status as BookingStatus)) {
      return fail("Invalid status.");
    }
    patch.status = b.status as BookingStatus;
  }

  if (b.reschedule !== undefined) {
    if (typeof b.reschedule !== "object" || b.reschedule === null) {
      return fail("Invalid reschedule payload.");
    }
    const r = b.reschedule as Record<string, unknown>;
    const mode = r.mode as ConsultMode;
    if (!MODES.includes(mode)) return fail("Invalid reschedule mode.");
    const date = str(r.date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Invalid reschedule date.");
    if (date < toISODate(nowIST())) return fail("Cannot reschedule into the past.");
    const time = str(r.time, 5);
    if (!TIME_RE.test(time)) return fail("Invalid reschedule time.");
    patch.reschedule = { mode, date, time };
  }

  if (patch.status === undefined && patch.reschedule === undefined) {
    return fail("Nothing to update.");
  }
  return ok(patch);
}
