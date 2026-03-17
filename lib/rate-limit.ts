import { redis } from "@/lib/redis";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const AI_RATE_LIMIT_MAX_REQUESTS = parsePositiveInt(
  process.env.AI_RATE_LIMIT_MAX_REQUESTS,
  60
);

export const AI_RATE_LIMIT_WINDOW_SECONDS = parsePositiveInt(
  process.env.AI_RATE_LIMIT_WINDOW_SECONDS,
  60
);

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export function buildUserRateLimitKey(userId: number, scope: string): string {
  return `rate-limit:${scope}:user:${userId}`;
}

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const used = await redis.incr(key);
    if (used === 1) {
      await redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(limit - used, 0);
    const allowed = used <= limit;

    let retryAfterSeconds = 0;
    if (!allowed) {
      const ttl = await redis.ttl(key);
      retryAfterSeconds = typeof ttl === "number" && ttl > 0 ? ttl : windowSeconds;
    }

    return {
      allowed,
      limit,
      remaining,
      retryAfterSeconds,
    };
  } catch (error) {
    // If Redis is unavailable, fail open to avoid blocking app usage.
    console.error("Rate limiter unavailable:", error);
    return {
      allowed: true,
      limit,
      remaining: limit,
      retryAfterSeconds: 0,
    };
  }
}

export function applyRateLimitHeaders(response: Response, rateLimit: RateLimitResult): Response {
  response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  if (!rateLimit.allowed && rateLimit.retryAfterSeconds > 0) {
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
  }
  return response;
}
