/**
 * Dev/demo mode switch — one flag, read on both client and server
 * (NEXT_PUBLIC_ vars are inlined at build time).
 *
 * true  → stub credentials login (any email) + localStorage persistence
 *         for likes/saves (see src/features/library/).
 * false → production mode: stub login disabled; persistence goes through
 *         the TODO(team) TT API seams instead of localStorage.
 */
export const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
