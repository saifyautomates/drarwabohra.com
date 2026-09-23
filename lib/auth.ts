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
  fs.mkdirSync(path.dirname(SESSIONS_FILE), { recursive: true });
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(tokens, null, 2), "utf8");
}

export function createSession(): string {
  const token = crypto.randomUUID();
  const tokens = readSessions();
  tokens.push(token);
  writeSessions(tokens.slice(-200)); // keep it bounded
  return token;
}

export function destroySession(token: string) {
  writeSessions(readSessions().filter((t) => t !== token));
}

export function isValidSession(token: string | null | undefined): boolean {
  if (!token) return false;
  return readSessions().includes(token);
}

export function getRequestToken(): string | null {
  return cookies().get(COOKIE)?.value ?? null;
}

export function isAdminRequest(): boolean {
  return isValidSession(getRequestToken());
}

export const ADMIN_COOKIE = COOKIE;
