// Relative path with an explicit .ts extension (not the `@/` alias) so plain
// node can run the seed-admin script, which imports this file. Same convention
// the old ./store.ts / ./password.ts imports followed.
import { supabaseAdmin, supabaseAuth } from "../supabase/admin.ts";

/**
 * The single seam between the app and whatever holds user accounts.
 *
 * Backend: Supabase Auth (GoTrue) — used ONLY for identity (login + sign-up).
 * Supabase owns nothing else in this app; NextAuth still issues the session JWT,
 * and roles still come from the ADMIN_EMAILS allowlist (src/lib/roles.ts).
 *
 * This file is the only thing that talks to Supabase for accounts. Swapping to
 * TT's auth endpoints later (docs/TT_API_ENDPOINTS.md §Auth) means changing this
 * file and src/lib/supabase/admin.ts, nothing else.
 */

/** A user as the rest of the app sees it — never carries a password. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export type RegisterResult =
  | { ok: true; user: PublicUser }
  | { ok: false; reason: "email_taken" };

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/** Prefer the name the user gave at sign-up; fall back to the email local-part. */
const nameFor = (email: string, metadata: Record<string, unknown> | undefined): string => {
  const fromMeta = metadata?.name;
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
  return email.split("@")[0] ?? email;
};

/**
 * Verifies an email/password pair against Supabase. Returns null for both "no
 * such user" and "wrong password" — callers must not distinguish the two to the
 * client, or the login form becomes an account-enumeration oracle. GoTrue
 * already returns an identical "Invalid login credentials" error for both, and
 * equalizes timing internally, so there is nothing extra to hide here.
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error || !data.user) return null;

  const user = data.user;
  return {
    id: user.id,
    email: user.email ?? normalizeEmail(email),
    name: nameFor(user.email ?? email, user.user_metadata),
  };
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<RegisterResult> {
  const email = normalizeEmail(input.email);
  // Admin createUser (not the public signUp) so the account is confirmed
  // immediately — the app has no email-verification flow, and this path also
  // runs from the seed-admin script. Password policy is already enforced by the
  // signup route's Zod schema before we get here.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name.trim() },
  });

  if (error) {
    // Duplicate address → email_taken so the client reports it without leaking
    // anything else. GoTrue signals this via code `email_exists` (or a 422 with
    // an "already been registered" message on older versions).
    if (error.code === "email_exists" || /already.*regist/i.test(error.message)) {
      return { ok: false, reason: "email_taken" };
    }
    // Any other failure (Supabase down, misconfig) is a real error — surface it
    // rather than masquerading as a taken email.
    throw new Error(`Supabase createUser failed: ${error.message}`);
  }

  const user = data.user;
  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? email,
      name: nameFor(user.email ?? email, user.user_metadata),
    },
  };
}
