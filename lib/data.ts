import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

/* ------------------------------------------------------------------ */
/* Types — DO NOT RENAME. Other builders code against this contract.    */
/* ------------------------------------------------------------------ */

export type ConsultMode = "in-clinic" | "video" | "audio";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "visited"
  | "no-show";

export interface FeeSchedule {
  "in-clinic": number;
  video: number;
  audio: number;
}

export interface Settings {
  clinicName: string;
  doctorName: string;
  doctorTitle: string;
  tagline: string;
  phone: string; // 10-digit
  whatsapp: string; // with country code, no +
  address: string;
  mapsLink: string;
  instagram: string;
  youtube: string;
  registration: string; // "" until clinic provides — NEVER invent
  fees: FeeSchedule;
  slotDurationMin: number;
  cancellationPolicy: string;
  otpMode: "demo" | "msg91";
  msg91Key: string; // placeholder, marked
  razorpayKey: string; // placeholder, marked
  paymentMode: "pay-at-clinic" | "advance-token";
  heroHeadline: string;
  heroSubline: string;
  aboutShort: string;
  upiNumber?: string;
  planAFee?: number;
  planBFee?: number;
  followUpAfter4Weeks?: number;
  hairSerumPrice?: number;
  faceSerumPrice?: number;
  shippingCharge?: number;
}

export type WeekDay = "0" | "1" | "2" | "3" | "4" | "5" | "6"; // 0=Sunday

export interface Schedule {
  hours: Record<
    WeekDay,
    Record<ConsultMode, { start: string; end: string } | null>
  >;
  slotDurationMin: number;
  blockedDates: string[]; // YYYY-MM-DD
}

export interface Treatment {
  id: string;
  slug: string;
  title: string;
  desc: string;
  sort: number;
}

export interface Testimonial {
  id: string;
  name: string;
  treatment: string;
  text: string;
  sample: boolean;
  sort: number;
}

export interface Booking {
  id: string; // DRB-####
  token: string;
  mode: ConsultMode;
  reasons: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM 24h
  name: string;
  age: number;
  gender: string;
  forSelf: boolean;
  relation?: string;
  mobile: string;
  complaint?: string;
  medicines?: string;
  status: BookingStatus;
  createdAt: string; // ISO
}

/* ------------------------------------------------------------------ */
/* JSON file store (data/*.json)                                       */
/*                                                                     */
/* NOTE: JSON-file persistence is a Phase A convenience. On serverless  */
/* hosts (e.g. Vercel) the filesystem is ephemeral between cold        */
/* starts and is not shared across instances — treat this as a local/  */
/* single-instance store and move to a real database before production  */
/* traffic. See README for details.                                    */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(file: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, file),
    JSON.stringify(value, null, 2) + "\n",
    "utf8"
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_SETTINGS: Settings = {
  clinicName: "Dr. Arwa Bohra",
  doctorName: "Dr. Arwa Bohra",
  doctorTitle: "Homeopathic Consultant · Skin & Hair Expert",
  tagline: "Gentle homeopathic care for skin and hair",
  phone: "8319623253",
  whatsapp: "918319623253",
  address: "Online E-Consultation Platform · Available Worldwide",
  mapsLink: "",
  instagram: "https://www.instagram.com/drarwabohra/",
  youtube: "https://www.youtube.com/@DrArwaBohra",
  registration: "",
  fees: { "in-clinic": 2000, video: 2000, audio: 2000 },
  slotDurationMin: 20,
  cancellationPolicy: "Free cancellation until 4 hours before your appointment.",
  otpMode: "demo",
  msg91Key: "",
  razorpayKey: "",
  paymentMode: "advance-token",
  heroHeadline: "Gentle, Proven Homeopathy for Skin, Hair & Health",
  heroSubline:
    "Welcome to Dr. Arwa Bohra’s E-Consultation Platform! Experience expert homeopathy from the comfort of your home via voice call.",
  aboutShort:
    "Dr. Arwa Bohra is a renowned Homeopathic Consultant and Skincare Expert with over 439,000 YouTube subscribers and 39 Million+ views, offering 1:1 online voice call consultations worldwide.",
};

export function getSettings(): Settings {
  const stored = readJson<Partial<Settings>>("settings.json", {});
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    fees: { ...DEFAULT_SETTINGS.fees, ...(stored.fees ?? {}) },
  };
}

export function saveSettings(s: Settings) {
  writeJson("settings.json", s);
}

/* ------------------------------------------------------------------ */
/* Schedule                                                            */
/* ------------------------------------------------------------------ */

function closedDay(): Record<ConsultMode, { start: string; end: string } | null> {
  return { "in-clinic": null, video: null, audio: null };
}

const DEFAULT_SCHEDULE: Schedule = {
  hours: {
    "0": closedDay(),
    "1": {
      "in-clinic": { start: "10:00", end: "13:00" },
      video: { start: "16:00", end: "18:00" },
      audio: { start: "18:00", end: "19:00" },
    },
    "2": {
      "in-clinic": { start: "10:00", end: "13:00" },
      video: { start: "16:00", end: "18:00" },
      audio: { start: "18:00", end: "19:00" },
    },
    "3": {
      "in-clinic": { start: "10:00", end: "13:00" },
      video: { start: "16:00", end: "18:00" },
      audio: { start: "18:00", end: "19:00" },
    },
    "4": {
      "in-clinic": { start: "10:00", end: "13:00" },
      video: { start: "16:00", end: "18:00" },
      audio: { start: "18:00", end: "19:00" },
    },
    "5": {
      "in-clinic": { start: "10:00", end: "13:00" },
      video: { start: "16:00", end: "18:00" },
      audio: { start: "18:00", end: "19:00" },
    },
    "6": {
      "in-clinic": { start: "10:00", end: "13:00" },
      video: { start: "16:00", end: "18:00" },
      audio: { start: "18:00", end: "19:00" },
    },
  },
  slotDurationMin: 20,
  blockedDates: [],
};

export function getSchedule(): Schedule {
  const stored = readJson<Partial<Schedule>>("schedule.json", {});
  return {
    slotDurationMin:
      typeof stored.slotDurationMin === "number"
        ? stored.slotDurationMin
        : DEFAULT_SCHEDULE.slotDurationMin,
    blockedDates: Array.isArray(stored.blockedDates) ? stored.blockedDates : [],
    hours: stored.hours ?? DEFAULT_SCHEDULE.hours,
  };
}

export function saveSchedule(s: Schedule) {
  writeJson("schedule.json", s);
}

/* ------------------------------------------------------------------ */
/* Treatments                                                          */
/* ------------------------------------------------------------------ */

export function getTreatments(): Treatment[] {
  const list = readJson<Treatment[]>("treatments.json", []);
  return [...list].sort((a, b) => a.sort - b.sort);
}

export function saveTreatments(list: Treatment[]) {
  writeJson("treatments.json", list);
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export function getTestimonials(): Testimonial[] {
  const list = readJson<Testimonial[]>("testimonials.json", []);
  return [...list].sort((a, b) => a.sort - b.sort);
}

export function saveTestimonials(list: Testimonial[]) {
  writeJson("testimonials.json", list);
}

/* ------------------------------------------------------------------ */
/* Videos — admin-managed YouTube / Instagram links shown in the        */
/* homepage "Videos" carousel. Empty store → section stays hidden.      */
/* ------------------------------------------------------------------ */

export type VideoType = "youtube" | "instagram";

export interface Video {
  id: string; // VID-###
  title: string;
  type: VideoType;
  url: string;
  active: boolean;
  order: number; // lower first
  createdAt: string; // ISO
}

export function getVideos(): Video[] {
  const list = readJson<Video[]>("videos.json", []);
  return [...list].sort((a, b) => a.order - b.order);
}

export function saveVideos(list: Video[]) {
  writeJson("videos.json", list);
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export function getBookings(): Booking[] {
  const list = readJson<Booking[]>("bookings.json", []);
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveBookings(list: Booking[]) {
  writeJson("bookings.json", list);
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}

export function getBookingByToken(token: string): Booking | undefined {
  return getBookings().find((b) => b.token === token);
}

function nextBookingId(bookings: Booking[]): string {
  let max = 0;
  for (const b of bookings) {
    const m = /^DRB-(\d+)$/.exec(b.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `DRB-${String(max + 1).padStart(4, "0")}`;
}

/** Creates a booking: sequential DRB-#### id, random token, status "pending". */
export function addBooking(
  b: Omit<Booking, "id" | "token" | "createdAt" | "status">
): Booking {
  const list = readJson<Booking[]>("bookings.json", []);
  const entry: Booking = {
    ...b,
    id: nextBookingId(list),
    token: tokenFor(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  list.push(entry);
  writeJson("bookings.json", list);
  return entry;
}

function tokenFor(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function updateBooking(
  id: string,
  patch: Partial<Booking>
): Booking | undefined {
  const list = readJson<Booking[]>("bookings.json", []);
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  const immutable = {
    id: list[idx].id,
    token: list[idx].token,
    createdAt: list[idx].createdAt,
  };
  const updated: Booking = { ...list[idx], ...patch, ...immutable };
  list[idx] = updated;
  writeJson("bookings.json", list);
  return updated;
}

/* ------------------------------------------------------------------ */
/* OTP verification nonces (single-use, 10-minute expiry)              */
/* Minted by POST /api/otp/verify on successful verification;          */
/* consumed by POST /api/book. Stored as data/otp_nonces.json:         */
/* [{ nonce, mobile, expiresAt }]. Expired entries are pruned on       */
/* write, so the file stays small and stale nonces can never verify.   */
/* ------------------------------------------------------------------ */

export interface OtpNonce {
  nonce: string;
  mobile: string;
  expiresAt: number; // epoch ms
}

const OTP_NONCE_FILE = "otp_nonces.json";
const OTP_NONCE_TTL_MS = 10 * 60 * 1000;

/** Mint a fresh nonce for a verified mobile number. */
export function mintOtpNonce(mobile: string): OtpNonce {
  const now = Date.now();
  const list = readJson<OtpNonce[]>(OTP_NONCE_FILE, []).filter(
    (n) => n.expiresAt > now
  );
  const nonce: OtpNonce = {
    nonce: crypto.randomUUID(),
    mobile,
    expiresAt: now + OTP_NONCE_TTL_MS,
  };
  list.push(nonce);
  writeJson(OTP_NONCE_FILE, list);
  return nonce;
}

/**
 * Consume a nonce: true only when it exists, is unexpired, and was minted
 * for this mobile. Consumption deletes it, so every nonce is single-use.
 */
export function consumeOtpNonce(nonce: string, mobile: string): boolean {
  const now = Date.now();
  const list = readJson<OtpNonce[]>(OTP_NONCE_FILE, []);
  const idx = list.findIndex(
    (n) => n.nonce === nonce && n.mobile === mobile && n.expiresAt > now
  );
  if (idx === -1) return false;
  list.splice(idx, 1);
  writeJson(OTP_NONCE_FILE, list);
  return true;
}

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

/** ₹500 · ₹85,000 · ₹1.2 Cr — simple INR formatting for fees. */
export function formatINR(n: number): string {
  if (!n || n <= 0) return "₹0";
  return `₹${n.toLocaleString("en-IN")}`;
}

/** WhatsApp deep link with prefilled message. */
export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function modeLabel(m: ConsultMode): string {
  if (m === "video") return "Video Consult";
  if (m === "audio") return "Voice Call Consultation";
  return "Voice Call Consultation";
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  visited: "Completed",
  "no-show": "No-show",
};

export const MODE_LABEL: Record<ConsultMode, string> = {
  "in-clinic": "Voice Call Consultation",
  video: "Video Consult",
  audio: "Voice Call Consultation",
};

export const WEEKDAY_LABEL: Record<WeekDay, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
};
