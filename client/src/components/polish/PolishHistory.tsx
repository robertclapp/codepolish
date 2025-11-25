import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Eye, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type PolishHistoryItem = {
  id: number;
  name: string;
  framework: string;
  status: string;
  qualityScoreBefore: number | null;
  qualityScoreAfter: number | null;
  processingTime: number | null;
  createdAt: Date;
};

type PolishHistoryProps = {
  polishes: PolishHistoryItem[];
  isLoading: boolean;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  onRetry: (id: number) => void;
};

export function PolishHistory({
  polishes,
  isLoading,
  onView,
  onDelete,
  onRetry,
}: PolishHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
      case "analyzing":
      case "polishing":
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreImprovement = (before: number | null, after: number | null) => {
    if (before === null || after === null) return null;
    const diff = after - before;
    return (
      <span className={diff > 0 ? "text-green-500" : "text-muted-foreground"}>
        {before} → {after} ({diff > 0 ? "+" : ""}{diff})
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Polish History</CardTitle>
          <CardDescription>View your recent code polishes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (polishes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Polish History</CardTitle>
          <CardDescription>View your recent code polishes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No polishes yet. Start by polishing your first code!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Polish History</CardTitle>
        <CardDescription>
          View your recent code polishes ({polishes.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Framework</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polishes.map((polish) => (
              <TableRow key={polish.id}>
                <TableCell className="font-medium">{polish.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {polish.framework}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(polish.status)}</TableCell>
                <TableCell>
                  {getScoreImprovement(
                    polish.qualityScoreBefore,
                    polish.qualityScoreAfter
                  ) ?? "-"}
                </TableCell>
                <TableCell>
                  {polish.processingTime
                    ? `${(polish.processingTime / 1000).toFixed(1)}s`
                    : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(polish.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(polish.id)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {polish.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRetry(polish.id)}
                        title="Retry"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(polish.id)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
