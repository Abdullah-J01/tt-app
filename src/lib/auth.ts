import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { notFound, redirect } from "next/navigation";
import { loginInputSchema } from "./authRules";
import { roleForEmail } from "./roles";
import { authenticateUser } from "./users/repository";

export type { Role } from "./roles";

/**
 * NextAuth (Auth.js) configuration.
 *
 * Sessions are stateless (JWT) — the app owns no database. Accounts live in the
 * file-backed store behind src/lib/users/repository, which is the single seam to
 * swap for TT's auth endpoints (docs/TT_API_ENDPOINTS.md §Auth). When that lands,
 * store the TT token in the jwt/session callbacks so `tt-api` can forward it as
 * the Authorization header.
 *
 * Admin is not a separate login: everyone signs in through the one credentials
 * flow below, and `roleForEmail` derives the role server-side on every request.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Returning null here surfaces as `CredentialsSignin` on the client.
      // Every failure — unknown email, wrong password, malformed input — must
      // look identical, or this becomes an account-enumeration oracle.
      async authorize(credentials) {
        const parsed = loginInputSchema.safeParse({
          email: credentials?.email ?? "",
          password: credentials?.password ?? "",
        });
        if (!parsed.success) return null;

        const user = await authenticateUser(parsed.data.email, parsed.data.password);
        if (!user) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
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
