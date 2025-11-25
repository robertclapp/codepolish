import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export type Plan = "free" | "pro" | "team" | "enterprise";

export function useSubscription() {
  const utils = trpc.useUtils();

  const subscriptionQuery = trpc.subscription.current.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const usageQuery = trpc.subscription.usage.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const plansQuery = trpc.subscription.plans.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.subscription.current.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const reactivateMutation = trpc.subscription.reactivate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.subscription.current.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reactivate subscription");
    },
  });

  const checkoutMutation = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.requiresStripeSetup) {
        toast.info(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start checkout");
    },
  });

  const subscription = subscriptionQuery.data;
  const usage = usageQuery.data;
  const plans = plansQuery.data ?? [];

  return {
    // Subscription data
    subscription,
    usage,
    plans,

    // Loading states
    isLoading: subscriptionQuery.isLoading || usageQuery.isLoading,
    isPlansLoading: plansQuery.isLoading,

    // Computed values
    creditsRemaining: subscription?.creditsRemaining ?? 0,
    creditsTotal: subscription?.creditsTotal ?? 0,
    currentPlan: (subscription?.plan as Plan) ?? "free",
    isActive: subscription?.isActive ?? false,
    usagePercentage: usage?.usagePercentage ?? 0,

    // Actions
    cancel: (reason?: string) => cancelMutation.mutateAsync({ reason }),
    reactivate: () => reactivateMutation.mutateAsync(),
    startCheckout: (plan: Plan) => checkoutMutation.mutateAsync({ plan }),

    // Mutation states
    isCancelling: cancelMutation.isPending,
    isReactivating: reactivateMutation.isPending,
    isCheckingOut: checkoutMutation.isPending,

    // Refresh
    refresh: () => {
      utils.subscription.current.invalidate();
      utils.subscription.usage.invalidate();
    },
  };
}
