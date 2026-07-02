import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

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
    // backend. TODO(team): replace `authorize` with a real TT login call.
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        if (!email) return null;
        return { id: email, email, name: email.split("@")[0] || "You" };
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
};
