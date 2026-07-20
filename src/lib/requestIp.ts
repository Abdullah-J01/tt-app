/**
 * Best-effort client IP, used only as a coarse abuse signal for rate limiting —
 * never for an authorization decision.
 *
 * Every header here is client-writable unless something in front of the app
 * overwrites it. That is the whole problem: trusting `x-real-ip` because it is
 * "the platform's header" is only sound on a platform that actually sets it.
 * nginx does not set it by default, and on a bare Node server nothing does — so
 * an unconditional read would let a client mint a fresh rate-limit bucket per
 * request just by varying a header, which is the same hole as naively taking
 * `x-forwarded-for[0]`.
 *
 * So trust is explicit, never inferred:
 *
 *   TRUSTED_IP_HEADER=x-vercel-forwarded-for   # Vercel
 *   TRUSTED_IP_HEADER=cf-connecting-ip         # Cloudflare
 *   TRUSTED_IP_HEADER=x-real-ip                # nginx, IF you set it yourself
 *
 * Set it to the one header your edge guarantees to overwrite. With it unset we
 * fall back to `x-forwarded-for` and count in from the right — the entry
 * appended by the outermost proxy we control — rather than the spoofable
 * leftmost one.
 */

/** The one header the deployment's edge is known to overwrite. Unset = trust none. */
const TRUSTED_IP_HEADER = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();

/**
 * How many proxies sit between the internet and this app, for the
 * `x-forwarded-for` fallback. 1 = a single edge. Raise it if you add a layer, or
 * the limiter starts bucketing on your own proxy's address.
 */
function trustedHops(): number {
  const parsed = Number(process.env.TRUSTED_PROXY_HOPS ?? 1);
  // A malformed value must not silently become NaN and skew the index below.
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

/**
 * Rate-limit buckets are keyed on this string and stored in a `text` column, so
 * an unvalidated header would let a caller write arbitrary-length junk. Accept
 * only something IP-shaped; anything else is treated as "no IP".
 */
const IP_PATTERN = /^[0-9a-fA-F:.]{3,45}$/;

const sanitize = (value: string | undefined): string | null => {
  if (!value) return null;
  // Even a platform header can arrive comma-separated; take the first entry.
  const first = value.split(",")[0]?.trim();
  if (!first || !IP_PATTERN.test(first)) return null;
  return first;
};

export function clientIp(request: Request): string | null {
  if (TRUSTED_IP_HEADER) {
    return sanitize(request.headers.get(TRUSTED_IP_HEADER) ?? undefined);
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;

  const hops = forwarded
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  if (hops.length === 0) return null;

  // Count in from the right: the last entry was appended by the nearest proxy,
  // and is the first one a client cannot forge.
  const index = Math.max(0, hops.length - trustedHops());
  return sanitize(hops[index] ?? hops[hops.length - 1]);
}
