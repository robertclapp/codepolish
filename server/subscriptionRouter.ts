import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { PRICING_TIERS, type PricingTier } from "./pricingConfig";

/**
 * Input validation schemas
 */
const planSchema = z.enum(["free", "pro", "team", "enterprise"]);

const upgradePlanInputSchema = z.object({
  plan: planSchema,
  stripePaymentMethodId: z.string().optional(),
});

const cancelSubscriptionInputSchema = z.object({
  reason: z.string().max(1000).optional(),
});

/**
 * Subscription router - handles subscription management
 */
export const subscriptionRouter = router({
  /**
   * Get current user's subscription status
   */
  current: protectedProcedure.query(async ({ ctx }) => {
    let subscription = await db.getUserSubscription(ctx.user.id);

    // Auto-create free subscription if none exists
    if (!subscription) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.createSubscription({
        userId: ctx.user.id,
        plan: "free",
        status: "active",
        creditsRemaining: PRICING_TIERS.free.credits,
        creditsTotal: PRICING_TIERS.free.credits,
        periodStart: now,
        periodEnd,
      });

      subscription = await db.getUserSubscription(ctx.user.id);
    }

    if (!subscription) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get subscription",
      });
    }

    const tier = PRICING_TIERS[subscription.plan as PricingTier];

    return {
      id: subscription.id,
      plan: subscription.plan,
      planName: tier?.name ?? subscription.plan,
      status: subscription.status,
      creditsRemaining: subscription.creditsRemaining,
      creditsTotal: subscription.creditsTotal,
      periodStart: subscription.periodStart,
      periodEnd: subscription.periodEnd,
      features: tier?.features ?? [],
      price: tier?.price ?? 0,
      isActive: subscription.status === "active",
      willRenew: subscription.status === "active" && !subscription.stripeSubscriptionId?.includes("canceled"),
    };
  }),

  /**
   * Get available pricing plans
   */
  plans: protectedProcedure.query(async () => {
    return Object.entries(PRICING_TIERS).map(([key, tier]) => ({
      id: key,
      name: tier.name,
      price: tier.price,
      credits: tier.credits,
      features: tier.features,
      popular: key === "pro",
    }));
  }),

  /**
   * Create a checkout session for upgrading plan
   */
  createCheckoutSession: protectedProcedure
    .input(upgradePlanInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { plan } = input;
      const tier = PRICING_TIERS[plan];

      if (!tier) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid plan",
        });
      }

      if (plan === "free") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot upgrade to free plan via checkout",
        });
      }

      if (plan === "enterprise") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contact sales for enterprise plan",
        });
      }

      // TODO: Implement Stripe checkout session creation
      // For now, return a mock response indicating Stripe integration is needed
      return {
        checkoutUrl: null,
        message: "Stripe integration pending. Contact support to upgrade.",
        requiresStripeSetup: true,
      };
    }),

  /**
   * Handle successful checkout (webhook callback)
   */
  handleCheckoutSuccess: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Verify Stripe session and update subscription
      // This would typically be called from a webhook handler

      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Stripe webhook handling not implemented",
      });
    }),

  /**
   * Cancel subscription
   */
  cancel: protectedProcedure
    .input(cancelSubscriptionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const subscription = await db.getUserSubscription(ctx.user.id);

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No subscription found",
        });
      }

      if (subscription.plan === "free") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot cancel free plan",
        });
      }

      // Update subscription status
      await db.updateSubscription(ctx.user.id, {
        status: "cancelled",
      });

      // TODO: Cancel Stripe subscription if applicable

      return {
        success: true,
        message: "Subscription cancelled. You will retain access until the end of your billing period.",
        accessUntil: subscription.periodEnd,
      };
    }),

  /**
   * Reactivate a cancelled subscription
   */
  reactivate: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);

    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No subscription found",
      });
    }

    if (subscription.status !== "cancelled") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Subscription is not cancelled",
      });
    }

    // Check if still within billing period
    if (new Date() > subscription.periodEnd) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Billing period has expired. Please create a new subscription.",
      });
    }

    await db.updateSubscription(ctx.user.id, {
      status: "active",
    });

    // TODO: Reactivate Stripe subscription if applicable

    return {
      success: true,
      message: "Subscription reactivated successfully",
    };
  }),

  /**
   * Get usage statistics
   */
  usage: protectedProcedure.query(async ({ ctx }) => {
    const [subscription, polishCount] = await Promise.all([
      db.getUserSubscription(ctx.user.id),
      db.getPolishCount(ctx.user.id),
    ]);

    if (!subscription) {
      return {
        creditsUsed: 0,
        creditsRemaining: 0,
        creditsTotal: 0,
        polishesThisPeriod: 0,
        polishesAllTime: polishCount,
        usagePercentage: 0,
      };
    }

    const creditsUsed = subscription.creditsTotal - subscription.creditsRemaining;

    return {
      creditsUsed,
      creditsRemaining: subscription.creditsRemaining,
      creditsTotal: subscription.creditsTotal,
      polishesThisPeriod: creditsUsed,
      polishesAllTime: polishCount,
      usagePercentage: subscription.creditsTotal > 0
        ? Math.round((creditsUsed / subscription.creditsTotal) * 100)
        : 0,
    };
  }),
});

export type SubscriptionRouter = typeof subscriptionRouter;
