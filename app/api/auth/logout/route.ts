import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, destroySession } from "@/lib/auth";

export async function POST() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (token) destroySession(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
