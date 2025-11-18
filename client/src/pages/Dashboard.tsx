import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Sparkles, Upload, Download, Github, Copy, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [polishName, setPolishName] = useState("");
  const [framework, setFramework] = useState<"react" | "vue" | "svelte">("react");
  const [isPolishing, setIsPolishing] = useState(false);

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

    setIsPolishing(true);
    
    try {
      // TODO: Implement actual polish mutation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success("Code polished successfully!");
    } catch (error) {
      toast.error("Failed to polish code. Please try again.");
    } finally {
      setIsPolishing(false);
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
              Credits: 5 remaining
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
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Original Code</CardTitle>
                  <CardDescription>
                    Paste your AI-generated code from MagicPath, v0, Lovable, or any other tool
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework</Label>
                    <Select value={framework} onValueChange={(value: any) => setFramework(value)}>
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
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Paste from Clipboard
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePolish}
                    disabled={isPolishing || !code.trim() || !polishName.trim()}
                  >
                    {isPolishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Polishing...
                      </>
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
                  {!isPolishing && !code ? (
                    <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
                      <div className="text-center space-y-2">
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Your polished code will appear here
                        </p>
                      </div>
                    </div>
                  ) : isPolishing ? (
                    <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                        <div className="space-y-2">
                          <p className="font-medium">Polishing your code...</p>
                          <p className="text-sm text-muted-foreground">This usually takes 30-60 seconds</p>
                        </div>
                        <Progress value={45} className="w-64" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Quality Score</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-destructive">Before: 45</span>
                              <span className="text-green-500">After: 92</span>
                            </div>
                            <Progress value={92} className="h-2" />
                          </div>
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            +47 points
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Improvements Made</Label>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Extracted 12 design tokens</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Split into 3 reusable components</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Added TypeScript types</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Fixed 8 accessibility issues</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Added error handling</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Polished Code</Label>
                        <Textarea
                          className="font-mono text-sm min-h-[300px]"
                          value="// Polished code will appear here..."
                          readOnly
                        />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download ZIP
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Github className="mr-2 h-4 w-4" />
                    Push to GitHub
                  </Button>
                  <Button variant="outline" className="flex-1">
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
                <CardDescription>
                  View your recent code polishes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No polishes yet. Start by polishing your first code!</p>
                </div>
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
                      <p className="font-medium">Free Plan</p>
                      <p className="text-sm text-muted-foreground">5 polishes per month</p>
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
