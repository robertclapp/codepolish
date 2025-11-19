import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity, Target, Bug, Clock } from "lucide-react";
import type { QualityDataPoint } from "@shared/schemas";

interface QualityTrendsProps {
  data: QualityDataPoint[];
  loading?: boolean;
}

export function QualityTrends({ data, loading }: QualityTrendsProps) {
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        averageScore: 0,
        totalPolishes: 0,
        totalIssuesFixed: 0,
        trend: 0,
        avgProcessingTime: 0,
      };
    }

    const totalPolishes = data.reduce((sum, d) => sum + d.totalPolishes, 0);
    const totalIssuesFixed = data.reduce((sum, d) => sum + d.issuesFixed, 0);
    const avgScore =
      data.reduce((sum, d) => sum + d.averageScore * d.totalPolishes, 0) /
      Math.max(totalPolishes, 1);

    // Calculate trend (last 7 days vs previous 7 days)
    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);
    const recentAvg =
      recent.reduce((sum, d) => sum + d.averageScore, 0) / Math.max(recent.length, 1);
    const previousAvg =
      previous.reduce((sum, d) => sum + d.averageScore, 0) / Math.max(previous.length, 1);
    const trend = recentAvg - previousAvg;

    return {
      averageScore: Math.round(avgScore),
      totalPolishes,
      totalIssuesFixed,
      trend: Math.round(trend),
      avgProcessingTime: 45, // Mock for now
    };
  }, [data]);

  const TrendIcon = stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus;
  const trendColor = stats.trend > 0 ? "text-green-500" : stats.trend < 0 ? "text-red-500" : "text-muted-foreground";

  // Simple bar chart visualization
  const maxScore = Math.max(...data.map((d) => d.averageScore), 100);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quality Trends</CardTitle>
          <CardDescription>Loading analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{stats.trend > 0 ? "+" : ""}{stats.trend} pts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Polishes</p>
                <p className="text-2xl font-bold">{stats.totalPolishes}</p>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues Fixed</p>
                <p className="text-2xl font-bold">{stats.totalIssuesFixed}</p>
              </div>
              <Bug className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{stats.avgProcessingTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
          <CardDescription>
            Quality score trends over the last {data.length} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>No data available yet. Start polishing to see trends!</p>
            </div>
          ) : (
            <div className="h-48">
              {/* Simple bar chart */}
              <div className="flex items-end justify-between h-full gap-1">
                {data.slice(-30).map((point, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end gap-1"
                  >
                    <div
                      className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{
                        height: `${(point.averageScore / maxScore) * 100}%`,
                        minHeight: point.totalPolishes > 0 ? "4px" : "0",
                      }}
                      title={`${new Date(point.date).toLocaleDateString()}: ${point.averageScore}`}
                    />
                    {i % 7 === 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(point.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common issues */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
          <CardDescription>Most frequently fixed issues in your code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Missing TypeScript types", count: 45, severity: "medium" },
              { name: "Accessibility violations", count: 32, severity: "high" },
              { name: "Console.log statements", count: 28, severity: "low" },
              { name: "Inline styles", count: 24, severity: "medium" },
              { name: "Missing error handling", count: 18, severity: "high" },
            ].map((issue) => (
              <div
                key={issue.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      issue.severity === "high"
                        ? "destructive"
                        : issue.severity === "medium"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {issue.severity}
                  </Badge>
                  <span className="text-sm">{issue.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {issue.count} times
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QualityTrends;
