/**
 * Simple in-memory rate limiter for local development and single-instance deployments.
 * For multi-region serverless production on Vercel, replace `checkRateLimit` with
 * `@upstash/ratelimit` + `@upstash/redis` using the same `{ allowed, remaining, resetAt }` signature.
 */

interface BucketEntry {
  timestamps: number[];
}

const buckets = new Map<string, BucketEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function checkRateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;
  const existing = buckets.get(key) ?? { timestamps: [] };

  const activeTimestamps = existing.timestamps.filter((t) => t > windowStart);

  if (activeTimestamps.length >= options.maxRequests) {
    const oldest = activeTimestamps[0] ?? now;
    const resetInSeconds = Math.max(
      1,
      Math.ceil((oldest + options.windowMs - now) / 1000)
    );
    buckets.set(key, { timestamps: activeTimestamps });
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  activeTimestamps.push(now);
  buckets.set(key, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - activeTimestamps.length),
    resetInSeconds: Math.ceil(options.windowMs / 1000),
  };
}
