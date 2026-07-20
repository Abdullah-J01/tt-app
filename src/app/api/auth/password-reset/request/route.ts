import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { passwordResetRequestSchema, RESEND_COOLDOWN_SECONDS } from "@/lib/authRules";
import { issueOtp, normalizeEmail, type IssueResult } from "@/lib/auth/passwordReset";
import { clientIp } from "@/lib/requestIp";
import { sendMail } from "@/lib/mail/mailer";
import { passwordResetOtpEmail } from "@/lib/mail/templates/passwordResetOtp";
import { findUserIdByEmail } from "@/lib/users/repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const parsed = passwordResetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const ip = clientIp(request);

  let userId: string | null;
  try {
    userId = await findUserIdByEmail(email);
  } catch (error) {
    console.error("[password-reset] user lookup failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  let issued: IssueResult;
  try {
    issued = await issueOtp({ email, userId, ip });
  } catch (error) {
    console.error("[password-reset] could not issue code", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (issued.status !== "ok") {
    if (issued.status === "probe_recorded") {
      return NextResponse.json({ error: "email_not_found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: issued.status, retryAfterSeconds: issued.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(issued.retryAfterSeconds) } },
    );
  }

  try {
    await sendMail(
      passwordResetOtpEmail({
        to: email,
        code: issued.code,
        expiresInMinutes: issued.expiresInMinutes,
        locale: isLocale(parsed.data.locale) ? parsed.data.locale : undefined,
      }),
    );
  } catch (error) {
    console.error("[password-reset] email delivery failed", error);
    return NextResponse.json({ error: "email_failed" }, { status: 502 });
  }

  // Never echo the code — the mailbox is the second factor.
  return NextResponse.json({
    ok: true,
    expiresInMinutes: issued.expiresInMinutes,
    resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
  });
}
