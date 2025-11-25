import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { polishRouter } from "./polishRouter";
import { subscriptionRouter } from "./subscriptionRouter";

export const appRouter = router({
  // System endpoints for health checks and admin notifications
  system: systemRouter,

  // Authentication endpoints
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Code polish operations
  polish: polishRouter,

  // Subscription and billing management
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
