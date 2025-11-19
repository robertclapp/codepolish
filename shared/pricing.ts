import type { SubscriptionPlan } from "./schemas";

export interface PricingTier {
  name: string;
  price: number | null;
  credits: number;
  features: string[];
}

export const PRICING_TIERS: Record<SubscriptionPlan, PricingTier> = {
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
  },
  enterprise: {
    name: "Enterprise",
    price: null,
    credits: -1, // Unlimited
    features: [
      "Unlimited polishes",
      "On-premise deployment",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
    ],
  },
};

export function getPlanCredits(plan: SubscriptionPlan): number {
  return PRICING_TIERS[plan].credits;
}

export function getPlanPrice(plan: SubscriptionPlan): number | null {
  return PRICING_TIERS[plan].price;
}

export function getPlanName(plan: SubscriptionPlan): string {
  return PRICING_TIERS[plan].name;
}
