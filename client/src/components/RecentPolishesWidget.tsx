import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import type { PolishResponse } from "@shared/schemas";

interface RecentPolishesWidgetProps {
  polishes: PolishResponse[];
  onSelect: (polish: PolishResponse) => void;
  onViewAll: () => void;
  loading?: boolean;
}

export function RecentPolishesWidget({
  polishes,
  onSelect,
  onViewAll,
  loading,
}: RecentPolishesWidgetProps) {
  const recentPolishes = polishes.slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Polishes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentPolishes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Polishes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent polishes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Recent Polishes</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentPolishes.map((polish) => (
          <button
            key={polish.id}
            onClick={() => onSelect(polish)}
            className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{polish.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {polish.framework}
                  </Badge>
                  <Badge
                    variant={
                      polish.status === "completed"
                        ? "default"
                        : polish.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {polish.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(polish.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {polish.qualityScoreAfter && (
                <div className="ml-3 text-right">
                  <div className="text-lg font-bold text-green-500">
                    {polish.qualityScoreAfter}
                  </div>
                  <div className="text-xs text-muted-foreground">score</div>
                </div>
              )}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export default RecentPolishesWidget;
