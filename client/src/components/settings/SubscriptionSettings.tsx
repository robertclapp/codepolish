import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";
import type { User } from "@shared/types";

type Plan = {
  id: string;
  name: string;
  price: number | null;
  credits: number;
  features: readonly string[] | string[];
  popular?: boolean;
};

type SubscriptionSettingsProps = {
  user: User | null;
  currentPlan: string;
  creditsRemaining: number;
  creditsTotal: number;
  usagePercentage: number;
  plans: Plan[];
  isLoading: boolean;
  onUpgrade: (planId: string) => void;
  onCancel: () => void;
  isUpgrading: boolean;
  isCancelling: boolean;
};

export function SubscriptionSettings({
  user,
  currentPlan,
  creditsRemaining,
  creditsTotal,
  usagePercentage,
  plans,
  isLoading,
  onUpgrade,
  onCancel,
  isUpgrading,
  isCancelling,
}: SubscriptionSettingsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlanInfo = plans.find((p) => p.id === currentPlan);

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{user?.name || "Not set"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email || "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg capitalize">{currentPlan} Plan</p>
                {currentPlan !== "free" && (
                  <Badge variant="secondary">Active</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPlanInfo?.credits === -1
                  ? "Unlimited polishes"
                  : `${currentPlanInfo?.credits ?? 0} polishes per month`}
              </p>
            </div>
            {currentPlan !== "free" && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Plan"
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Credits Used</span>
              <span className="font-medium">
                {creditsTotal - creditsRemaining} / {creditsTotal}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {creditsRemaining} credits remaining this month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {currentPlan === "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Get more polishes and unlock premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans
                .filter((plan) => plan.id !== "free" && plan.id !== "enterprise")
                .map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 border rounded-lg ${
                      plan.popular ? "border-primary shadow-md" : ""
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold">{plan.name}</h3>
                        <p className="text-2xl font-bold">
                          ${plan.price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /month
                          </span>
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => onUpgrade(plan.id)}
                        disabled={isUpgrading}
                      >
                        {isUpgrading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Upgrade"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Need unlimited polishes or custom features?
              </p>
              <Button variant="link" onClick={() => onUpgrade("enterprise")}>
                Contact Sales for Enterprise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
