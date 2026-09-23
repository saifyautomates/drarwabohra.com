import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

/* ------------------------------------------------------------------ */
/* Light in-memory rate limit: 5 OTP sends per mobile per minute.       */
/* (Resets on redeploy/cold start — a real SMS setup should rate-limit  */
/* at the provider level too.)                                         */
/* ------------------------------------------------------------------ */
const attempts = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const history = (attempts.get(key) ?? []).filter((t) => now - t < 60_000);
  history.push(now);
  attempts.set(key, history);
  return history.length > 5;
}

function normalizeMobile(raw: unknown): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  const ten =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  if (!/^[6-9]\d{9}$/.test(ten)) return null;
  return ten;
}

/**
 * POST /api/otp/send  { mobile }
 * In demo OTP mode no real SMS is sent — the client may submit any
 * 6-digit code to /api/otp/verify.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mobile = normalizeMobile(body?.mobile);
  if (!mobile) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }
  if (rateLimited(`otp-send:${mobile}`)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const settings = getSettings();
  if (settings.otpMode !== "demo") {
    // INTEGRATION: MSG91 — real OTP send.
    //   POST https://control.msg91.com/api/v5/otp?template_id=<TEMPLATE_ID>
    //        &mobile=91<mobile>&authkey=<settings.msg91Key>
    // Keep settings.msg91Key server-side only; never expose it to clients.
    return NextResponse.json(
      {
        error:
          "SMS OTP is not configured yet. Please ask the clinic to add the MSG91 key in Admin → Settings.",
      },
      { status: 501 }
    );
  }

  return NextResponse.json({
    demo: true,
    message: "Demo mode — OTP is 123456",
  });
}
