import { COOKIE_NAME } from "@shared/const";
import {
  CreatePolishInputSchema,
  GetPolishInputSchema,
  ListPolishesInputSchema,
  DeletePolishInputSchema,
  SubscriptionPlanSchema,
} from "@shared/schemas";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { polishService } from "./services/polishService";
import { subscriptionService } from "./services/subscriptionService";

export const appRouter = router({
  // System routes for health checks and admin notifications
  system: systemRouter,

  // Authentication routes
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Polish routes - code refactoring operations
  polish: router({
    // Create a new polish job
    create: protectedProcedure
      .input(CreatePolishInputSchema)
      .mutation(async ({ ctx, input }) => {
        const polish = await polishService.createPolish(ctx.user.id, input);
        // Start processing in background
        polishService.processPolish(polish.id).catch((err) => {
          console.error(`Failed to process polish ${polish.id}:`, err);
        });
        return polish;
      }),

    // Get a single polish by ID
    get: protectedProcedure
      .input(GetPolishInputSchema)
      .query(async ({ ctx, input }) => {
        return polishService.getPolish(ctx.user.id, input.polishId);
      }),

    // List user's polishes with pagination
    list: protectedProcedure
      .input(ListPolishesInputSchema)
      .query(async ({ ctx, input }) => {
        return polishService.listPolishes(
          ctx.user.id,
          input.limit,
          input.offset,
          input.status
        );
      }),

    // Delete a polish
    delete: protectedProcedure
      .input(DeletePolishInputSchema)
      .mutation(async ({ ctx, input }) => {
        await polishService.deletePolish(ctx.user.id, input.polishId);
        return { success: true } as const;
      }),
  }),

  // Subscription routes
  subscription: router({
    // Get current subscription (creates default if none exists)
    get: protectedProcedure.query(async ({ ctx }) => {
      return subscriptionService.getOrCreateSubscription(ctx.user.id);
    }),

    // Get remaining credits
    credits: protectedProcedure.query(async ({ ctx }) => {
      const remaining = await subscriptionService.getRemainingCredits(
        ctx.user.id
      );
      return { credits: remaining };
    }),

    // Upgrade subscription plan
    upgrade: protectedProcedure
      .input(SubscriptionPlanSchema)
      .mutation(async ({ ctx, input }) => {
        return subscriptionService.upgradePlan(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
