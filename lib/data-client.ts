/* ------------------------------------------------------------------ */
/* Client-safe mirror of the pure helpers in lib/data.ts and lib/slots. */
/*                                                                     */
/* lib/data.ts imports node:fs / node:path for its JSON-file store,    */
/* so it can NEVER be bundled into a client component. Any value       */
/* import of "@/lib/data" from a "use client" file breaks the webpack  */
/* build (UnhandledSchemeError: node:fs).                               */
/*                                                                     */
/* This file re-implements the formatting helpers WITHOUT the fs store. */
/* Keep it in sync with lib/data.ts manually. Type-only imports from   */
/* "@/lib/data" remain fine in client files (they are erased at compile */
/* time).                                                              */
/* ------------------------------------------------------------------ */

import type { ConsultMode, WeekDay } from "@/lib/data";

/** ₹500 · ₹85,000 — simple INR formatting for fees. */
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

export const WEEKDAY_LABEL: Record<WeekDay, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
};

/** "2026-09-22" -> "Mon, 22 Sep" */
export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${days[dt.getDay()]}, ${d} ${months[dt.getMonth()]}`;
}

/** "18:30" -> "6:30 PM" */
export function formatTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/* ------------------------------------------------------------------ */
/* Video URL parsing — pure helpers shared by the public carousel       */
/* (client) and the admin sanitizer (server, via this module).          */
/* ------------------------------------------------------------------ */

export type VideoKind = "youtube" | "instagram";

export interface ParsedVideoUrl {
  type: VideoKind;
  /** YouTube: 11-char video id · Instagram: post/reel shortcode */
  key: string;
}

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);
const IG_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const IG_CODE_RE = /^[A-Za-z0-9_-]{5,40}$/;

/**
 * Extract the platform + key from a YouTube or Instagram URL.
 * Accepts: youtube watch?v= / youtu.be/ / /shorts/ / /embed/ / /live/,
 * instagram /reel/ / /p/ / /reels/ / /tv/ . Returns null when the URL
 * is not a recognizable public video link.
 */
export function parseVideoUrl(raw: string): ParsedVideoUrl | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase();

  if (YT_HOSTS.has(host)) {
    const path = u.pathname;
    // youtu.be/<id>
    if (host === "youtu.be" || host === "www.youtu.be") {
      const id = path.split("/").filter(Boolean)[0] ?? "";
      return YT_ID_RE.test(id) ? { type: "youtube", key: id } : null;
    }
    // /shorts/<id> · /embed/<id> · /live/<id>
    const seg = path.split("/").filter(Boolean);
    if (seg.length >= 2 && ["shorts", "embed", "live"].includes(seg[0])) {
      return YT_ID_RE.test(seg[1]) ? { type: "youtube", key: seg[1] } : null;
    }
    // /watch?v=<id>
    const v = u.searchParams.get("v") ?? "";
    return YT_ID_RE.test(v) ? { type: "youtube", key: v } : null;
  }

  if (IG_HOSTS.has(host)) {
    const seg = u.pathname.split("/").filter(Boolean);
    // /reel/<code> · /p/<code> · /reels/<code> · /tv/<code>
    if (
      seg.length >= 2 &&
      ["reel", "p", "reels", "tv"].includes(seg[0]) &&
      IG_CODE_RE.test(seg[1])
    ) {
      return { type: "instagram", key: seg[1] };
    }
    return null;
  }

  return null;
}

/** Click-to-play thumbnail (no iframe mounted until the user taps). */
export function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}

/** Public-post embed page; works for /reel/, /p/, /reels/, /tv/ alike. */
export function instagramEmbedUrl(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}/embed`;
}

export function instagramWatchUrl(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}/`;
}
