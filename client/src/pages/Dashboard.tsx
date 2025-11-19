import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  Download,
  Github,
  Copy,
  Loader2,
  CheckCircle2,
  Trash2,
  Clock,
  AlertCircle,
  GitCompare,
  Code,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl, PRICING_TIERS } from "@/const";
import type { Framework, PolishResponse } from "@shared/schemas";
import { FileUpload } from "@/components/FileUpload";
import { CodeDiffViewer } from "@/components/CodeDiffViewer";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [polishName, setPolishName] = useState("");
  const [framework, setFramework] = useState<Framework>("react");
  const [activePolish, setActivePolish] = useState<PolishResponse | null>(null);
  const [outputView, setOutputView] = useState<"code" | "diff">("code");
  const utils = trpc.useUtils();

  // Fetch subscription data
  const subscriptionQuery = trpc.subscription.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch polish history
  const polishesQuery = trpc.polish.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: isAuthenticated }
  );

  // Create polish mutation
  const createPolishMutation = trpc.polish.create.useMutation({
    onSuccess: (polish) => {
      setActivePolish(polish);
      toast.success("Polish started! Processing your code...");
      utils.subscription.get.invalidate();
      utils.polish.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create polish");
    },
  });

  // Get polish query for polling
  const activePolishQuery = trpc.polish.get.useQuery(
    { polishId: activePolish?.id ?? 0 },
    {
      enabled: !!activePolish && activePolish.status !== "completed" && activePolish.status !== "failed",
      refetchInterval: 2000, // Poll every 2 seconds
    }
  );

  // Delete polish mutation
  const deletePolishMutation = trpc.polish.delete.useMutation({
    onSuccess: () => {
      toast.success("Polish deleted");
      utils.polish.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete polish");
    },
  });

  // Update active polish when polling returns new data
  useEffect(() => {
    if (activePolishQuery.data) {
      setActivePolish(activePolishQuery.data);
      if (activePolishQuery.data.status === "completed") {
        toast.success("Code polished successfully!");
        utils.polish.list.invalidate();
      } else if (activePolishQuery.data.status === "failed") {
        toast.error(activePolishQuery.data.errorMessage || "Polish failed");
        utils.subscription.get.invalidate(); // Credits may have been refunded
      }
    }
  }, [activePolishQuery.data, utils]);

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

  const handlePolish = async () => {
    if (!code.trim()) {
      toast.error("Please paste some code first");
      return;
    }

    if (!polishName.trim()) {
      toast.error("Please give your polish a name");
      return;
    }

    createPolishMutation.mutate({
      name: polishName,
      framework,
      originalCode: code,
    });
  };

  const handleCopyCode = async () => {
    if (activePolish?.polishedCode) {
      await navigator.clipboard.writeText(activePolish.polishedCode);
      toast.success("Code copied to clipboard");
    }
  };

  const handleDownload = () => {
    if (activePolish?.polishedCode) {
      const blob = new Blob([activePolish.polishedCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activePolish.name.replace(/\s+/g, "-").toLowerCase()}.tsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Code downloaded");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
      toast.success("Code pasted from clipboard");
    } catch {
      toast.error("Failed to read clipboard");
    }
  };

  const loadPolish = (polish: PolishResponse) => {
    setActivePolish(polish);
    setCode(polish.originalCode);
    setPolishName(polish.name);
    setFramework(polish.framework);
  };

  const credits = subscriptionQuery.data?.creditsRemaining ?? 0;
  const plan = subscriptionQuery.data?.plan ?? "free";
  const isPolishing =
    createPolishMutation.isPending ||
    (activePolish && !["completed", "failed"].includes(activePolish.status));

  const getProgressValue = () => {
    if (!activePolish) return 0;
    switch (activePolish.status) {
      case "pending":
        return 10;
      case "analyzing":
        return 40;
      case "polishing":
        return 70;
      case "completed":
        return 100;
      case "failed":
        return 100;
      default:
        return 0;
    }
  };

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
              Credits: {credits} remaining
            </Badge>
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <ThemeToggle />
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
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Original Code</CardTitle>
                  <CardDescription>
                    Paste your AI-generated code from MagicPath, v0, Lovable, or
                    any other tool
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="polish-name">Polish Name</Label>
                    <Input
                      id="polish-name"
                      placeholder="e.g., Landing Page Component"
                      value={polishName}
                      onChange={(e) => setPolishName(e.target.value)}
                      disabled={isPolishing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework</Label>
                    <Select
                      value={framework}
                      onValueChange={(value: Framework) => setFramework(value)}
                      disabled={isPolishing}
                    >
                      <SelectTrigger id="framework">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Textarea
                      id="code"
                      placeholder="Paste your code here..."
                      className="font-mono text-sm min-h-[400px]"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isPolishing}
                    />
                  </div>

                  <FileUpload
                    onFileContent={(content, filename) => {
                      setCode(content);
                      if (!polishName) {
                        setPolishName(filename.replace(/\.[^/.]+$/, ""));
                      }
                    }}
                    disabled={isPolishing}
                  />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handlePasteFromClipboard}
                    disabled={isPolishing}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Paste from Clipboard
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePolish}
                    disabled={
                      isPolishing ||
                      !code.trim() ||
                      !polishName.trim() ||
                      credits < 1
                    }
                  >
                    {isPolishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Polishing...
                      </>
                    ) : credits < 1 ? (
                      "No credits remaining"
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Polish Code (1 credit)
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Output Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Polished Code</CardTitle>
                  <CardDescription>
                    Production-ready code with improvements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!activePolish ? (
                    <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
                      <div className="text-center space-y-2">
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Your polished code will appear here
                        </p>
                      </div>
                    </div>
                  ) : activePolish.status === "failed" ? (
                    <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-destructive/10">
                      <div className="text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                        <div className="space-y-2">
                          <p className="font-medium text-destructive">
                            Polish Failed
                          </p>
                          <p className="text-sm text-muted-foreground max-w-md">
                            {activePolish.errorMessage ||
                              "An error occurred while processing your code"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : activePolish.status !== "completed" ? (
                    <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                        <div className="space-y-2">
                          <p className="font-medium">
                            {activePolish.status === "pending"
                              ? "Starting analysis..."
                              : activePolish.status === "analyzing"
                              ? "Analyzing code quality..."
                              : "Polishing your code..."}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            This usually takes 30-60 seconds
                          </p>
                        </div>
                        <Progress value={getProgressValue()} className="w-64" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Quality Score</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-destructive">
                                Before: {activePolish.qualityScoreBefore ?? 0}
                              </span>
                              <span className="text-green-500">
                                After: {activePolish.qualityScoreAfter ?? 0}
                              </span>
                            </div>
                            <Progress
                              value={activePolish.qualityScoreAfter ?? 0}
                              className="h-2"
                            />
                          </div>
                          <Badge
                            variant="outline"
                            className="text-green-500 border-green-500"
                          >
                            +
                            {(activePolish.qualityScoreAfter ?? 0) -
                              (activePolish.qualityScoreBefore ?? 0)}{" "}
                            points
                          </Badge>
                        </div>
                      </div>

                      {activePolish.improvementsSummary && (
                        <div className="space-y-2">
                          <Label>Improvements Made</Label>
                          <div className="space-y-1 text-sm">
                            {activePolish.improvementsSummary.tokensExtracted >
                              0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>
                                  Extracted{" "}
                                  {activePolish.improvementsSummary.tokensExtracted}{" "}
                                  design tokens
                                </span>
                              </div>
                            )}
                            {activePolish.improvementsSummary.componentsCreated >
                              0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>
                                  Split into{" "}
                                  {activePolish.improvementsSummary.componentsCreated}{" "}
                                  reusable components
                                </span>
                              </div>
                            )}
                            {activePolish.improvementsSummary.typesAdded > 0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>
                                  Added {activePolish.improvementsSummary.typesAdded}{" "}
                                  TypeScript types
                                </span>
                              </div>
                            )}
                            {activePolish.improvementsSummary.accessibilityFixes >
                              0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>
                                  Fixed{" "}
                                  {activePolish.improvementsSummary.accessibilityFixes}{" "}
                                  accessibility issues
                                </span>
                              </div>
                            )}
                            {activePolish.improvementsSummary.securityFixes >
                              0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>
                                  Fixed{" "}
                                  {activePolish.improvementsSummary.securityFixes}{" "}
                                  security issues
                                </span>
                              </div>
                            )}
                            {activePolish.improvementsSummary.documentationAdded && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Added documentation</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Output</Label>
                          <div className="flex gap-1">
                            <Button
                              variant={outputView === "code" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setOutputView("code")}
                            >
                              <Code className="h-3 w-3 mr-1" />
                              Code
                            </Button>
                            <Button
                              variant={outputView === "diff" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setOutputView("diff")}
                            >
                              <GitCompare className="h-3 w-3 mr-1" />
                              Diff
                            </Button>
                          </div>
                        </div>
                        {outputView === "code" ? (
                          <Textarea
                            className="font-mono text-sm min-h-[300px]"
                            value={activePolish.polishedCode || ""}
                            readOnly
                          />
                        ) : (
                          <CodeDiffViewer
                            originalCode={activePolish.originalCode}
                            polishedCode={activePolish.polishedCode || ""}
                          />
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDownload}
                    disabled={!activePolish?.polishedCode}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1" disabled>
                    <Github className="mr-2 h-4 w-4" />
                    Push to GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyCode}
                    disabled={!activePolish?.polishedCode}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Polish History</CardTitle>
                <CardDescription>View your recent code polishes</CardDescription>
              </CardHeader>
              <CardContent>
                {polishesQuery.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !polishesQuery.data?.items.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No polishes yet. Start by polishing your first code!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {polishesQuery.data.items.map((polish) => (
                      <div
                        key={polish.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => loadPolish(polish)}
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{polish.name}</h3>
                            <Badge variant="secondary">{polish.framework}</Badge>
                            <Badge
                              variant={
                                polish.status === "completed"
                                  ? "default"
                                  : polish.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {polish.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(polish.createdAt).toLocaleDateString()}
                            </span>
                            {polish.qualityScoreBefore !== null &&
                              polish.qualityScoreAfter !== null && (
                                <span>
                                  Score: {polish.qualityScoreBefore} →{" "}
                                  {polish.qualityScoreAfter}
                                </span>
                              )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deletePolishMutation.mutate({ polishId: polish.id })
                          }
                          disabled={deletePolishMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Current Plan</Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">
                        {PRICING_TIERS[plan]?.name || plan} Plan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {credits} of {subscriptionQuery.data?.creditsTotal ?? 0}{" "}
                        credits remaining
                      </p>
                    </div>
                    <Button>Upgrade to Pro</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Information</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{user?.name || "Not set"}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{user?.email || "Not set"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
