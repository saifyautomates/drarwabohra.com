import { NextResponse } from "next/server";
import { getSettings, mintOtpNonce } from "@/lib/data";

/**
 * POST /api/otp/verify  { mobile, code }
 * Demo mode: any 6-digit code is accepted. Real MSG91 verification goes
 * where marked below when otpMode is switched to "msg91".
 *
 * On success a single-use, 10-minute server-side nonce is minted and
 * returned as `otpNonce`. The client must send it back with POST /api/book —
 * /api/book consumes (deletes) it, so a booking cannot be placed without a
 * freshly verified OTP.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mobile = String(body?.mobile ?? "").replace(/\D/g, "");
  const code = String(body?.code ?? "").trim();

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid 10-digit mobile number." },
      { status: 400 }
    );
  }

  const settings = getSettings();
  if (settings.otpMode !== "demo") {
    // INTEGRATION: MSG91 — real OTP verification.
    //   POST https://control.msg91.com/api/v5/otp/verify
    //        ?mobile=91<mobile>&otp=<code>&authkey=<settings.msg91Key>
    // Accept only when the provider response type is "success".
    return NextResponse.json(
      { ok: false, error: "SMS OTP is not configured yet." },
      { status: 501 }
    );
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { ok: false, error: "Enter the 6-digit code." },
      { status: 400 }
    );
  }
  const nonce = mintOtpNonce(mobile);
  return NextResponse.json({ ok: true, otpNonce: nonce.nonce });
}
