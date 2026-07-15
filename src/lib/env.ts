/**
 * Dev/demo mode switch — one flag, read on both client and server
 * (NEXT_PUBLIC_ vars are inlined at build time).
 *
 * true  → localStorage persistence for likes/saves (see src/features/library/).
 * false → production mode: persistence goes through the TODO(team) TT API
 *         seams instead of localStorage.
 *
 * Note: this no longer gates login. Credentials sign-in verifies a real hashed
 * password in every mode (src/lib/auth.ts).
 */
export const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
