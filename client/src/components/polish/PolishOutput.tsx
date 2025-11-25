import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download, Github, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { PolishResult, PolishStatus } from "@/hooks/usePolish";

type PolishOutputProps = {
  status: PolishStatus;
  result: PolishResult | null;
  hasCode: boolean;
};

export function PolishOutput({ status, result, hasCode }: PolishOutputProps) {
  const handleCopyCode = async () => {
    if (result?.polishedCode) {
      await navigator.clipboard.writeText(result.polishedCode);
      toast.success("Code copied to clipboard");
    }
  };

  const handleDownloadZip = () => {
    if (!result?.polishedCode) return;

    // Create a simple download of the polished code
    const blob = new Blob([result.polishedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "polished-code.tsx";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Code downloaded");
  };

  const handlePushToGithub = () => {
    toast.info("GitHub integration coming soon!");
  };

  // Idle state - no code entered yet
  if (status === "idle" && !hasCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Polished Code</CardTitle>
          <CardDescription>
            Production-ready code with improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center space-y-2">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Your polished code will appear here
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download ZIP
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            <Github className="mr-2 h-4 w-4" />
            Push to GitHub
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Processing state
  if (status === "analyzing" || status === "polishing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Polished Code</CardTitle>
          <CardDescription>
            Production-ready code with improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="font-medium">
                  {status === "analyzing" ? "Analyzing your code..." : "Polishing your code..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  This usually takes 30-60 seconds
                </p>
              </div>
              <Progress value={status === "analyzing" ? 30 : 70} className="w-64" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download ZIP
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            <Github className="mr-2 h-4 w-4" />
            Push to GitHub
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Completed state
  if (status === "completed" && result) {
    const scoreDiff = (result.qualityScoreAfter ?? 0) - (result.qualityScoreBefore ?? 0);
    const summary = result.improvementsSummary;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Polished Code</CardTitle>
          <CardDescription>
            Production-ready code with improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quality Score</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-destructive">
                    Before: {result.qualityScoreBefore ?? "N/A"}
                  </span>
                  <span className="text-green-500">
                    After: {result.qualityScoreAfter ?? "N/A"}
                  </span>
                </div>
                <Progress value={result.qualityScoreAfter ?? 0} className="h-2" />
              </div>
              <Badge variant="outline" className="text-green-500 border-green-500">
                +{scoreDiff} points
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Improvements Made</Label>
            <div className="space-y-1 text-sm">
              {summary?.designTokensExtracted && summary.designTokensExtracted > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Extracted {summary.designTokensExtracted} design tokens</span>
                </div>
              )}
              {summary?.componentsCreated && summary.componentsCreated > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Split into {summary.componentsCreated} reusable components</span>
                </div>
              )}
              {summary?.typesAdded && summary.typesAdded > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Added {summary.typesAdded} TypeScript types</span>
                </div>
              )}
              {summary?.accessibilityFixes && summary.accessibilityFixes > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Fixed {summary.accessibilityFixes} accessibility issues</span>
                </div>
              )}
              {summary?.errorHandlingAdded && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Added error handling</span>
                </div>
              )}
              {summary?.documentationAdded && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Added documentation</span>
                </div>
              )}
            </div>
          </div>

          {result.issuesFound.length > 0 && (
            <div className="space-y-2">
              <Label>Issues Found ({result.issuesFound.length})</Label>
              <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                {result.issuesFound.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge
                      variant={
                        issue.severity === "high"
                          ? "destructive"
                          : issue.severity === "medium"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {issue.severity}
                    </Badge>
                    <span>{issue.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Polished Code</Label>
            <Textarea
              className="font-mono text-sm min-h-[300px]"
              value={result.polishedCode ?? ""}
              readOnly
            />
          </div>

          {result.processingTime && (
            <p className="text-xs text-muted-foreground text-right">
              Processed in {(result.processingTime / 1000).toFixed(1)}s
            </p>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownloadZip}>
            <Download className="mr-2 h-4 w-4" />
            Download ZIP
          </Button>
          <Button variant="outline" className="flex-1" onClick={handlePushToGithub}>
            <Github className="mr-2 h-4 w-4" />
            Push to GitHub
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleCopyCode}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Polished Code</CardTitle>
          <CardDescription>
            Production-ready code with improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-destructive/10">
            <div className="text-center space-y-2">
              <p className="font-medium text-destructive">Polish failed</p>
              <p className="text-sm text-muted-foreground">
                Please try again or contact support
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download ZIP
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            <Github className="mr-2 h-4 w-4" />
            Push to GitHub
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Default/waiting state
  return (
    <Card>
      <CardHeader>
        <CardTitle>Polished Code</CardTitle>
        <CardDescription>
          Production-ready code with improvements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
          <div className="text-center space-y-2">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Click "Polish Code" to transform your code
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1" disabled>
          <Download className="mr-2 h-4 w-4" />
          Download ZIP
        </Button>
        <Button variant="outline" className="flex-1" disabled>
          <Github className="mr-2 h-4 w-4" />
          Push to GitHub
        </Button>
        <Button variant="outline" className="flex-1" disabled>
          <Copy className="mr-2 h-4 w-4" />
          Copy Code
        </Button>
      </CardFooter>
    </Card>
  );
}
