import { fakeVerifyDelay, hashPassword, verifyPassword } from "./password.ts";
import { findUserByEmail, insertUser, normalizeEmail } from "./store.ts";

/**
 * The single seam between the app and whatever holds user accounts.
 *
 * Today: the local JSON store in ./store, with scrypt-hashed passwords.
 * TODO(team): point `authenticateUser` at TT's login endpoint and
 * `registerUser` at TT's sign-up endpoint (docs/TT_API_ENDPOINTS.md §Auth),
 * then delete ./store and ./password. Nothing else in the app reads the store
 * directly, so this file is the only thing that has to change.
 */

/** A user as the rest of the app sees it — never carries the password hash. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export type RegisterResult =
  | { ok: true; user: PublicUser }
  | { ok: false; reason: "email_taken" };

/**
 * Verifies an email/password pair. Returns null for both "no such user" and
 * "wrong password" — callers must not distinguish the two to the client, or the
 * login form becomes an account-enumeration oracle.
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    // Equalize latency with the found-user path (see fakeVerifyDelay).
    await fakeVerifyDelay();
    return null;
  }
  if (!(await verifyPassword(password, user.passwordHash))) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<RegisterResult> {
  const passwordHash = await hashPassword(input.password);
  const created = await insertUser({
    email: normalizeEmail(input.email),
    name: input.name,
    passwordHash,
  });
  if (!created) return { ok: false, reason: "email_taken" };
  return { ok: true, user: { id: created.id, email: created.email, name: created.name } };
}
