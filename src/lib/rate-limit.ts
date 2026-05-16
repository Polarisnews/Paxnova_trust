import "server-only";
import { headers } from "next/headers";

/**
 * In-process token-bucket rate limiter. Suitable for a single-process VPS
 * deployment (PM2 single instance). If we ever scale to multiple Node
 * workers behind a load balancer this needs to move to Redis / SQLite.
 *
 * Strategy
 *   - Each (scope, key) pair gets its own bucket.
 *   - The bucket holds up to `max` tokens.
 *   - Tokens refill linearly over `refillSeconds`.
 *   - Each call consumes one token; if the bucket is empty the call is
 *     denied and a retry-after value is returned.
 *
 * This catches credential stuffing, brute force, and signup spam without
 * the operational complexity of an external rate-limit service.
 */

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

// Periodic eviction of cold buckets so the map doesn't grow unbounded.
const EVICT_AFTER_MS = 60 * 60 * 1000; // 1 hour idle
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const cutoff = Date.now() - EVICT_AFTER_MS;
      for (const [k, v] of buckets) {
        if (v.updatedAt < cutoff) buckets.delete(k);
      }
    },
    10 * 60 * 1000
  ).unref?.();
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

/**
 * Consume one token from the bucket for `(scope, key)`.
 *   max: bucket size (also the burst allowance).
 *   refillSeconds: how long it takes to refill the full bucket.
 */
export function rateLimit(
  scope: string,
  key: string,
  max: number,
  refillSeconds: number
): RateLimitResult {
  const id = `${scope}:${key}`;
  const now = Date.now();
  const prev = buckets.get(id);

  let tokens = max;
  if (prev) {
    const elapsedSec = (now - prev.updatedAt) / 1000;
    tokens = Math.min(max, prev.tokens + (elapsedSec * max) / refillSeconds);
  }

  if (tokens < 1) {
    const deficit = 1 - tokens;
    const retryAfterSeconds = Math.ceil((deficit * refillSeconds) / max);
    buckets.set(id, { tokens, updatedAt: now });
    return { ok: false, retryAfterSeconds };
  }

  tokens -= 1;
  buckets.set(id, { tokens, updatedAt: now });
  return { ok: true, remaining: Math.floor(tokens) };
}

/** Reset a bucket (e.g. after a successful login). */
export function resetRateLimit(scope: string, key: string): void {
  buckets.delete(`${scope}:${key}`);
}

/**
 * Best-effort client IP. Honors X-Forwarded-For (set by nginx) and falls
 * back to the direct connection. Always trims to the first hop because
 * downstream proxies append, not prepend.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
