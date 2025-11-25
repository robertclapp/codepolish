import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { checkRateLimit, createRateLimitKey, RATE_LIMITS, type RateLimitType } from "./rateLimit";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;

/**
 * Rate limiting middleware factory
 */
const createRateLimitMiddleware = (type: RateLimitType) =>
  t.middleware(async (opts) => {
    const { ctx, next, path } = opts;
    const userId = ctx.user?.id;
    const key = createRateLimitKey(userId, path, type);

    checkRateLimit(key, RATE_LIMITS[type]);

    return next();
  });

/**
 * Authentication middleware
 */
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Admin authorization middleware
 */
const requireAdmin = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Public procedure - no authentication required, standard rate limiting
 */
export const publicProcedure = t.procedure.use(createRateLimitMiddleware('query'));

/**
 * Protected procedure - requires authentication, standard rate limiting
 */
export const protectedProcedure = t.procedure
  .use(createRateLimitMiddleware('mutation'))
  .use(requireUser);

/**
 * Admin procedure - requires admin role, standard rate limiting
 */
export const adminProcedure = t.procedure
  .use(createRateLimitMiddleware('mutation'))
  .use(requireAdmin);

/**
 * Rate-limited polish procedure - strict rate limiting for expensive operations
 */
export const polishProcedure = t.procedure
  .use(createRateLimitMiddleware('polish'))
  .use(requireUser);
