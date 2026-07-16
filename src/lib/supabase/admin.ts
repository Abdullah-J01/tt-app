import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase clients used purely as the identity backend for auth
 * (login + sign-up). Supabase owns nothing else in this app — no data tables,
 * no RLS, no realtime. The rest of the stack (NextAuth JWT sessions, the
 * ADMIN_EMAILS role gate, every server guard) is unchanged; this module only
 * validates credentials and creates accounts behind src/lib/users/repository.
 *
 * Importing this from a client component leaks the service-role key, so it must
 * stay server-only. The `pg` store had the same guardrail via its node import;
 * here the guard is the throw below plus the fact that nothing client-side
 * imports it (repository.ts — the sole importer — is server-only).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  // Fail loud at import rather than 500-ing the first login. A missing Supabase
  // var is always a misconfiguration, never a normal runtime state. See .env.example.
  throw new Error(
    "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL, " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY. See .env.example.",
  );
}

// These clients are per-request stateless credential checkers — we never want
// them persisting or refreshing a session (NextAuth owns the session cookie),
// so disable both. Otherwise concurrent requests would clobber a shared session.
const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
} as const;

/**
 * Anon-key client for verifying credentials (signInWithPassword). The anon key
 * is the correct key for public auth operations; it validates the password via
 * GoTrue and returns the user without touching any privileged surface.
 */
export const supabaseAuth: SupabaseClient = createClient(SUPABASE_URL, ANON_KEY, clientOptions);

/**
 * Service-role client for admin operations (admin.createUser). Bypasses email
 * confirmation so accounts are usable immediately — the app has no email flow
 * and roles are derived from ADMIN_EMAILS, not Supabase. NEVER expose this key
 * to the client.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  clientOptions,
);
