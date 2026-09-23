import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, createSession } from "@/lib/auth";

/* Light in-memory rate limit: max 10 attempts per IP per minute */
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now >= entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  if (isRateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again in a minute." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const expected = adminPassword();
  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(expected, "utf8");
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Invalid password" },
      { status: 401 }
    );
  }

  const token = createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });
  return res;
}
