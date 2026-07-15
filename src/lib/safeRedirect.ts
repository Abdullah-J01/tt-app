/**
 * Guards post-login redirect targets against open redirects.
 *
 * A `startsWith("/") && !startsWith("//")` check is NOT enough. WHATWG URL
 * parsing folds backslashes and leading control characters into slashes for
 * special schemes, so several inputs pass that check and still resolve
 * off-origin:
 *
 *   "/\evil.com"    (from ?callbackUrl=/%5Cevil.com)  -> https://evil.com
 *   "/\t/evil.com"  (from ?callbackUrl=/%09/evil.com) -> https://evil.com
 *
 * Rather than blacklisting those, resolve the candidate against the real origin
 * and require the result to stay on it — that defers to the same parser the
 * browser will use to navigate.
 */
export function isSafeInternalPath(candidate: string | null | undefined, origin: string): boolean {
  if (!candidate || !candidate.startsWith("/")) return false;
  try {
    return new URL(candidate, origin).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

/** `candidate` when it stays on `origin`, else `fallback`. */
export function safeInternalPath(
  candidate: string | null | undefined,
  origin: string,
  fallback: string,
): string {
  return isSafeInternalPath(candidate, origin) ? candidate! : fallback;
}
