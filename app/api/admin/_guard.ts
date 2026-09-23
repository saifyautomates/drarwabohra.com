import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

/** Returns a 401 JSON response when the request is not an admin request. */
export function deny() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function readBody(req: Request): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    const body = await req.json();
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      ),
    };
  }
}
