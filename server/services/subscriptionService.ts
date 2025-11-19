import { TRPCError } from "@trpc/server";
import * as db from "../db";
import {
  SubscriptionPlan,
  SubscriptionResponse,
  UpdateSubscriptionInput,
} from "@shared/schemas";
import type { Subscription } from "../../drizzle/schema";
import { PRICING_TIERS } from "@shared/pricing";

/**
 * Service layer for subscription operations
 */
export class SubscriptionService {
  /**
   * Get or create subscription for user
   */
  async getOrCreateSubscription(userId: number): Promise<SubscriptionResponse> {
    let subscription = await db.getUserSubscription(userId);

    if (!subscription) {
      // Create default free subscription
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      await db.createSubscription({
        userId,
        plan: "free",
        status: "active",
        creditsRemaining: PRICING_TIERS.free.credits,
        creditsTotal: PRICING_TIERS.free.credits,
        periodEnd,
      });

      subscription = await db.getUserSubscription(userId);
      if (!subscription) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subscription",
        });
      }
    }

    return this.transformSubscription(subscription);
  }

  /**
   * Update subscription (for Stripe webhook handlers)
   */
  async updateSubscription(
    userId: number,
    updates: UpdateSubscriptionInput
  ): Promise<SubscriptionResponse> {
    const subscription = await db.getUserSubscription(userId);
    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription not found",
      });
    }

    await db.updateSubscription(userId, updates);

    const updated = await db.getUserSubscription(userId);
    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update subscription",
      });
    }

    return this.transformSubscription(updated);
  }

  /**
   * Upgrade subscription to a new plan
   */
  async upgradePlan(
    userId: number,
    newPlan: SubscriptionPlan
  ): Promise<SubscriptionResponse> {
    const subscription = await db.getUserSubscription(userId);
    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription not found",
      });
    }

    const planConfig = PRICING_TIERS[newPlan];
    if (!planConfig) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid plan",
      });
    }

    // Calculate new credits (carry over remaining + new allocation)
    const newCredits = planConfig.credits === -1
      ? 999999 // Unlimited
      : subscription.creditsRemaining + planConfig.credits;

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await db.updateSubscription(userId, {
      plan: newPlan,
      creditsRemaining: newCredits,
      creditsTotal: planConfig.credits === -1 ? 999999 : planConfig.credits,
      periodEnd,
    });

    const updated = await db.getUserSubscription(userId);
    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upgrade subscription",
      });
    }

    return this.transformSubscription(updated);
  }

  /**
   * Reset monthly credits (called by cron job)
   */
  async resetMonthlyCredits(userId: number): Promise<void> {
    const subscription = await db.getUserSubscription(userId);
    if (!subscription) return;

    const planConfig = PRICING_TIERS[subscription.plan as SubscriptionPlan];
    if (!planConfig) return;

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await db.updateSubscription(userId, {
      creditsRemaining: planConfig.credits === -1 ? 999999 : planConfig.credits,
      periodStart: new Date(),
      periodEnd,
    });
  }

  /**
   * Check if user has available credits
   */
  async hasCredits(userId: number, required: number = 1): Promise<boolean> {
    const subscription = await db.getUserSubscription(userId);
    if (!subscription) return false;
    return subscription.creditsRemaining >= required;
  }

  /**
   * Get remaining credits for user
   */
  async getRemainingCredits(userId: number): Promise<number> {
    const subscription = await db.getUserSubscription(userId);
    return subscription?.creditsRemaining ?? 0;
  }

  /**
   * Transform database subscription to API response
   */
  private transformSubscription(subscription: Subscription): SubscriptionResponse {
    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan as SubscriptionPlan,
      status: subscription.status as "active" | "cancelled" | "expired",
      creditsRemaining: subscription.creditsRemaining,
      creditsTotal: subscription.creditsTotal,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      periodStart: subscription.periodStart,
      periodEnd: subscription.periodEnd,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
