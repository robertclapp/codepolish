export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "CodePolish";

export const APP_LOGO = "https://placehold.co/128x128/6366F1/FFFFFF?text=CP";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Pricing tiers
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
    price: null, // Custom pricing
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
