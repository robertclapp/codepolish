export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
export { PRICING_TIERS } from "@shared/pricing";
export type { SubscriptionPlan as PricingTier } from "@shared/schemas";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "CodePolish";

export const APP_LOGO = "https://placehold.co/128x128/6366F1/FFFFFF?text=CP";

/**
 * Generate login URL at runtime so redirect URI reflects the current origin.
 */
export const getLoginUrl = (): string => {
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
