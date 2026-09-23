import { cookies } from "next/headers";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const COOKIE = "drb_admin";
const SESSIONS_FILE = path.join(process.cwd(), "data", "sessions.json");

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "arwaadmin2026";
}

function readSessions(): string[] {
  try {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8")) as string[];
  } catch {
    return [];
  }
}

function writeSessions(tokens: string[]) {
  try {
    fs.mkdirSync(path.dirname(SESSIONS_FILE), { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(tokens, null, 2), "utf8");
  } catch {
    // Graceful fallback on read-only serverless filesystems
  }
}

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function createSession(): string {
  const timestamp = Date.now();
  const signature = crypto
    .createHmac("sha256", adminPassword())
    .update(`session:${timestamp}`)
    .digest("hex")
    .slice(0, 32);
  const token = `drbs_${timestamp}_${signature}`;
  try {
    const tokens = readSessions();
    tokens.push(token);
    writeSessions(tokens.slice(-200));
  } catch {
    // Non-fatal
  }
  return token;
}

export function destroySession(token: string) {
  try {
    writeSessions(readSessions().filter((t) => t !== token));
  } catch {}
}

export function isValidSession(token: string | null | undefined): boolean {
  if (!token) return false;
  if (token.startsWith("drbs_")) {
    const parts = token.split("_");
    if (parts.length === 3) {
      const timestamp = Number(parts[1]);
      const signature = parts[2];
      if (timestamp + SESSION_TTL_MS > Date.now()) {
        const expected = crypto
          .createHmac("sha256", adminPassword())
          .update(`session:${timestamp}`)
          .digest("hex")
          .slice(0, 32);
        if (signature === expected) return true;
      }
    }
  }
  return readSessions().includes(token);
}

export function getRequestToken(): string | null {
  return cookies().get(COOKIE)?.value ?? null;
}

export function isAdminRequest(): boolean {
  return isValidSession(getRequestToken());
}

export const ADMIN_COOKIE = COOKIE;
