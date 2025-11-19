import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl, PRICING_TIERS } from "@/const";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QualityTrends } from "@/components/QualityTrends";
import { LearningSuggestions, generateMockSuggestions } from "@/components/LearningSuggestions";
import { ApiKeyManager } from "@/components/ApiKeyManager";
import { trpc } from "@/lib/trpc";
import type { QualityDataPoint, ApiKey } from "@shared/schemas";
import { useState } from "react";
import { toast } from "sonner";

export default function Analytics() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Mock data for demonstration
  const [qualityData] = useState<QualityDataPoint[]>(() => {
    const data: QualityDataPoint[] = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date,
        averageScore: Math.floor(50 + Math.random() * 40),
        totalPolishes: Math.floor(Math.random() * 5),
        issuesFixed: Math.floor(Math.random() * 20),
      });
    }
    return data;
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 1,
      name: "CI/CD Pipeline",
      keyPrefix: "cpk_live_abc",
      lastUsed: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 604800000),
      expiresAt: null,
    },
  ]);

  const suggestions = generateMockSuggestions();

  // Fetch subscription data
  const subscriptionQuery = trpc.subscription.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCreateApiKey = async (name: string): Promise<{ key: string; id: number }> => {
    // Mock API key creation
    const newKey: ApiKey = {
      id: Date.now(),
      name,
      keyPrefix: `cpk_live_${Math.random().toString(36).substring(7)}`,
      lastUsed: null,
      createdAt: new Date(),
      expiresAt: null,
    };
    setApiKeys([...apiKeys, newKey]);
    return {
      key: `cpk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      id: newKey.id,
    };
  };

  const handleDeleteApiKey = async (id: number) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const credits = subscriptionQuery.data?.creditsRemaining ?? 0;
  const plan = subscriptionQuery.data?.plan ?? "free";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              ← Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold">Analytics & Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {PRICING_TIERS[plan]?.name || plan} Plan
            </Badge>
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Quality Trends</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="api">
              API Access
              {plan === "free" && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Pro
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Quality Trends Tab */}
          <TabsContent value="trends">
            <QualityTrends data={qualityData} />
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning">
            <LearningSuggestions suggestions={suggestions} />
          </TabsContent>

          {/* API Access Tab */}
          <TabsContent value="api">
            {plan === "free" ? (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  API Access is a Pro Feature
                </h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to Pro to get programmatic access to CodePolish
                </p>
                <Button onClick={() => toast.info("Stripe integration coming soon!")}>
                  Upgrade to Pro
                </Button>
              </div>
            ) : (
              <ApiKeyManager
                apiKeys={apiKeys}
                onCreateKey={handleCreateApiKey}
                onDeleteKey={handleDeleteApiKey}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
