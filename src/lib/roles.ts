/** App-level authorization roles carried in the session (see src/types/next-auth.d.ts). */
export type Role = "admin" | "user";

/**
 * MVP admin gate: a comma-separated `ADMIN_EMAILS` env allowlist.
 * TODO(team): replace with TT's role claim once TT auth is confirmed
 * (docs/TT_API_ENDPOINTS.md §B) — this module is the single swap point.
 *
 * Lives apart from ./auth so the signup route can consult the allowlist without
 * importing all of NextAuth.
 */
function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return email ? allowlist().includes(email.trim().toLowerCase()) : false;
}

export function roleForEmail(email: string | null | undefined): Role {
  return isAdminEmail(email) ? "admin" : "user";
}
