import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { notFound, redirect } from "next/navigation";
import { IS_DEV_MODE } from "./env";

/** App-level authorization roles carried in the session (see src/types/next-auth.d.ts). */
export type Role = "admin" | "user";

/**
 * MVP admin gate: a comma-separated `ADMIN_EMAILS` env allowlist.
 * TODO(team): replace with TT's role claim once TT auth is confirmed
 * (docs/TT_API_ENDPOINTS.md §B) — this function is the single swap point.
 */
function roleForEmail(email: string | null | undefined): Role {
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return email && allowlist.includes(email.toLowerCase()) ? "admin" : "user";
}

/**
 * NextAuth (Auth.js) configuration — MVP stub.
 *
 * This app owns no database, so sessions are stateless (JWT).
 * TODO(team) — confirm with TT how users authenticate (docs/TT_API_ENDPOINTS.md §Auth):
 *  - If TT provides auth: add a Credentials provider that calls TT's login
 *    endpoint, then store the returned TT token in the JWT (jwt/session
 *    callbacks) so `tt-api` can forward it as the Authorization header.
 *  - If we own sign-in: keep Google below and add persistence only if needed.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // Demo/stub sign-in — accepts any email so the login flow works without a
    // backend. Dev mode only (NEXT_PUBLIC_DEV_MODE).
    // TODO(team): in production, add a Credentials provider that calls TT's
    // login endpoint instead of this stub.
    ...(IS_DEV_MODE
      ? [
          CredentialsProvider({
            name: "Email",
            credentials: {
              // `name` is only sent on sign-up; login omits it and we derive one.
              name: { label: "Name", type: "text" },
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              const email = credentials?.email?.trim();
              if (!email) return null;
              const name = credentials?.name?.trim() || email.split("@")[0] || "You";
              return { id: email, email, name };
            },
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    // Recomputed on every request so allowlist changes apply without re-login.
    async jwt({ token }) {
      token.role = roleForEmail(token.email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role ?? "user";
      return session;
    },
  },
};

/**
 * Server-side auth guards. Call from layouts/pages to gate a subtree, and again
 * from every server action that mutates data — a layout guard alone does not
 * protect directly-invoked actions.
 */
export async function requireUser(callbackUrl = "/feed"): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session;
}

/** Requires an admin session. Non-admins get a 404 so /admin stays undiscoverable. */
export async function requireAdmin(callbackUrl = "/admin"): Promise<Session> {
  const session = await requireUser(callbackUrl);
  if (session.user.role !== "admin") notFound();
  return session;
}
