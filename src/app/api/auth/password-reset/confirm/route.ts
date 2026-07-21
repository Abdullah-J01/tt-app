import { NextResponse } from "next/server";
import { passwordResetConfirmSchema } from "@/lib/authRules";
import { consumeOtpRecord, verifyResetTicket } from "@/lib/auth/passwordReset";
import { updateUserPassword } from "@/lib/users/repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const parsed = passwordResetConfirmSchema.safeParse(body);
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((issue) => issue.path[0] === "confirmPassword");
    return NextResponse.json(
      { error: mismatch ? "password_mismatch" : "invalid_input" },
      { status: 400 },
    );
  }

  const payload = verifyResetTicket(parsed.data.ticket);
  if (!payload) {
    return NextResponse.json({ error: "invalid_ticket" }, { status: 401 });
  }

  let burned: boolean;
  try {
    burned = await consumeOtpRecord(payload.id);
  } catch (error) {
    console.error("[password-reset] could not consume code", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!burned) {
    return NextResponse.json({ error: "invalid_ticket" }, { status: 401 });
  }

  try {
    await updateUserPassword(payload.userId, parsed.data.password);
  } catch (error) {
    console.error("[password-reset] password update failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
