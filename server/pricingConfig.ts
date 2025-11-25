/**
 * Server-side pricing configuration
 * This is the source of truth for pricing tiers
 */

export const PRICING_TIERS = {
  free: {
    name: "Free",
    price: 0,
    credits: 5,
    features: [
      "5 code polishes per month",
      "Basic refactoring",
      "Quality score analysis",
      "Download as ZIP",
    ],
  },
  pro: {
    name: "Pro",
    price: 19,
    credits: 100,
    features: [
      "100 code polishes per month",
      "All refactoring features",
      "Test generation",
      "Documentation generation",
      "GitHub integration",
      "Priority processing",
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  team: {
    name: "Team",
    price: 49,
    credits: 500,
    features: [
      "500 code polishes per month",
      "All Pro features",
      "Team workspace",
      "Shared component library",
      "Custom refactoring rules",
      "API access",
    ],
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID,
  },
  enterprise: {
    name: "Enterprise",
    price: null as number | null, // Custom pricing
    credits: -1, // Unlimited
    features: [
      "Unlimited polishes",
      "On-premise deployment",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

export function getPlanCredits(plan: PricingTier): number {
  const tier = PRICING_TIERS[plan];
  return tier.credits === -1 ? Number.MAX_SAFE_INTEGER : tier.credits;
}

export function isValidPlan(plan: string): plan is PricingTier {
  return plan in PRICING_TIERS;
}
