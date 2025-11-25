import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePolish, type Framework } from "@/hooks/usePolish";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { PolishInput } from "@/components/polish/PolishInput";
import { PolishOutput } from "@/components/polish/PolishOutput";
import { PolishHistory } from "@/components/polish/PolishHistory";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Polish state
  const [code, setCode] = useState("");
  const [polishName, setPolishName] = useState("");
  const [framework, setFramework] = useState<Framework>("react");

  // Hooks
  const {
    polish,
    deletePolish,
    currentPolish,
    status,
    isPolishing,
    polishes,
    polishesLoading,
  } = usePolish();

  const {
    plans,
    isLoading: subscriptionLoading,
    creditsRemaining,
    creditsTotal,
    currentPlan,
    usagePercentage,
    cancel,
    startCheckout,
    isCancelling,
    isCheckingOut,
  } = useSubscription();

  // Handlers
  const handlePolish = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please paste some code first");
      return;
    }

    if (!polishName.trim()) {
      toast.error("Please give your polish a name");
      return;
    }

    await polish(polishName, code, framework);
  }, [code, polishName, framework, polish]);

  const handleViewPolish = useCallback((_id: number) => {
    toast.info("Polish details view coming soon!");
  }, []);

  const handleRetryPolish = useCallback((_id: number) => {
    toast.info("Retry functionality coming soon!");
  }, []);

  const handleUpgrade = useCallback(
    (planId: string) => {
      if (planId === "enterprise") {
        toast.info("Please contact sales@codepolish.dev for enterprise pricing");
        return;
      }
      startCheckout(planId as "pro" | "team");
    },
    [startCheckout]
  );

  const handleCancel = useCallback(async () => {
    try {
      await cancel();
    } catch {
      // Error handled in hook
    }
  }, [cancel]);

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              ← Back to Home
            </Button>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Credits: {creditsRemaining} remaining
            </Badge>
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="polish" className="space-y-6">
          <TabsList>
            <TabsTrigger value="polish">Polish Code</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Polish Tab */}
          <TabsContent value="polish" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <PolishInput
                name={polishName}
                onNameChange={setPolishName}
                code={code}
                onCodeChange={setCode}
                framework={framework}
                onFrameworkChange={setFramework}
                onPolish={handlePolish}
                isPolishing={isPolishing}
                creditsRemaining={creditsRemaining}
              />
              <PolishOutput
                status={status}
                result={currentPolish}
                hasCode={code.length > 0}
              />
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <PolishHistory
              polishes={polishes}
              isLoading={polishesLoading}
              onView={handleViewPolish}
              onDelete={deletePolish}
              onRetry={handleRetryPolish}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SubscriptionSettings
              user={user}
              currentPlan={currentPlan}
              creditsRemaining={creditsRemaining}
              creditsTotal={creditsTotal}
              usagePercentage={usagePercentage}
              plans={plans}
              isLoading={subscriptionLoading}
              onUpgrade={handleUpgrade}
              onCancel={handleCancel}
              isUpgrading={isCheckingOut}
              isCancelling={isCancelling}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
