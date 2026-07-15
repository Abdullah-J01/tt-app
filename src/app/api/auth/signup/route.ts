import { NextResponse } from "next/server";
import { signupInputSchema } from "@/lib/authRules";
import { isAdminEmail } from "@/lib/roles";
import { registerUser } from "@/lib/users/repository";

/**
 * Creates an account, then the client calls signIn() to get a session.
 * NextAuth has no sign-up concept — the Credentials provider only verifies an
 * existing user — so registration needs its own endpoint.
 *
 * Responses carry a stable `error` code; the client maps it to a localized
 * message (the translator only exists client-side).
 * TODO(team): swap registerUser for TT's sign-up endpoint — see users/repository.
 */

// Uses node:crypto + node:fs via the repository, so it must not run on edge.
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  // The real enforcement point: client-side Zod is skippable by posting here
  // directly, this is not.
  const parsed = signupInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  // Roles are derived from the ADMIN_EMAILS allowlist, so letting anyone
  // self-register an allowlisted address would hand them the admin CMS on a
  // fresh deploy — and permanently lock the real admin out via email_taken.
  // Admin accounts are seeded out-of-band instead (`npm run seed:admin`).
  // Reported as email_taken so this isn't an oracle for the allowlist.
  if (isAdminEmail(parsed.data.email)) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const result = await registerUser(parsed.data);
  if (!result.ok) {
    // 409, and the client says so plainly. Sign-up genuinely cannot hide that an
    // email is taken; the login form is where enumeration is worth preventing.
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  // No session here — the client follows up with signIn(). Never return the hash.
  return NextResponse.json({ ok: true }, { status: 201 });
}
