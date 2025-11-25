import { TRPCError } from "@trpc/server";

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis for distributed rate limiting
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, entry] = entries[i];
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export type RateLimitConfig = {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  message?: string;      // Custom error message
};

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 60,         // 60 requests per minute
  message: "Too many requests, please try again later",
};

/**
 * Rate limit configurations by procedure type
 */
export const RATE_LIMITS = {
  // Very restrictive for expensive operations
  polish: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "Polish rate limit exceeded. Please wait before polishing more code.",
  },
  // Moderate for mutations
  mutation: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: "Too many requests. Please slow down.",
  },
  // Lenient for queries
  query: {
    windowMs: 60 * 1000,
    maxRequests: 120,
    message: "Too many requests. Please try again later.",
  },
  // Strict for auth attempts
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 10,
    message: "Too many authentication attempts. Please wait before trying again.",
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check rate limit for a given identifier
 * @returns true if within limit, throws TRPCError if exceeded
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): boolean {
  const now = Date.now();
  const key = identifier;

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // No entry or expired - create new
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `${config.message} Retry after ${retryAfterSeconds} seconds.`,
    });
  }

  // Increment count
  entry.count++;
  return true;
}

/**
 * Create a rate limit key based on user ID and procedure path
 */
export function createRateLimitKey(
  userId: number | string | undefined,
  procedurePath: string,
  type: RateLimitType
): string {
  const userPart = userId ?? "anonymous";
  return `ratelimit:${type}:${userPart}:${procedurePath}`;
}

/**
 * Get remaining requests for an identifier
 */
export function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    return {
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Express middleware for global rate limiting
 */
export function createRateLimitMiddleware(config: RateLimitConfig = DEFAULT_CONFIG) {
  return (req: any, res: any, next: any) => {
    const identifier = req.ip || req.connection.remoteAddress || "unknown";

    try {
      checkRateLimit(`global:${identifier}`, config);
      next();
    } catch (error) {
      if (error instanceof TRPCError && error.code === "TOO_MANY_REQUESTS") {
        res.status(429).json({
          error: error.message,
        });
      } else {
        next(error);
      }
    }
  };
}
