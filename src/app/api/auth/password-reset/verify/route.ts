import { NextResponse } from "next/server";
import { passwordResetVerifySchema } from "@/lib/authRules";
import { normalizeEmail, verifyOtp } from "@/lib/auth/passwordReset";
import { clientIp } from "@/lib/requestIp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const parsed = passwordResetVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);

  let result;
  try {
    result = await verifyOtp({ email, code: parsed.data.code, ip: clientIp(request) });
  } catch (error) {
    console.error("[password-reset] verification failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!result.ok) {
    if (result.reason === "rate_limited") {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const status = result.reason === "invalid_code" ? 400 : 410;
    return NextResponse.json(
      { error: result.reason, attemptsLeft: result.attemptsLeft },
      { status },
    );
  }

  return NextResponse.json({ ok: true, ticket: result.ticket });
}
