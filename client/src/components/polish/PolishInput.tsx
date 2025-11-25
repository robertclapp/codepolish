import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Upload, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Framework } from "@/hooks/usePolish";

type PolishInputProps = {
  name: string;
  onNameChange: (name: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
  framework: Framework;
  onFrameworkChange: (framework: Framework) => void;
  onPolish: () => void;
  isPolishing: boolean;
  creditsRemaining: number;
};

export function PolishInput({
  name,
  onNameChange,
  code,
  onCodeChange,
  framework,
  onFrameworkChange,
  onPolish,
  isPolishing,
  creditsRemaining,
}: PolishInputProps) {
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onCodeChange(text);
      toast.success("Code pasted from clipboard");
    } catch {
      toast.error("Failed to read clipboard. Please paste manually.");
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,.jsx,.ts,.tsx,.vue,.svelte";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        onCodeChange(text);
        if (!name) {
          onNameChange(file.name.replace(/\.[^/.]+$/, ""));
        }
        toast.success(`Loaded ${file.name}`);
      }
    };
    input.click();
  };

  const canPolish = code.trim().length > 0 && name.trim().length > 0 && creditsRemaining > 0;

  return (
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
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={isPolishing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="framework">Framework</Label>
          <Select
            value={framework}
            onValueChange={(value) => onFrameworkChange(value as Framework)}
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
            onChange={(e) => onCodeChange(e.target.value)}
            disabled={isPolishing}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleFileUpload}
            disabled={isPolishing}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePasteFromClipboard}
            disabled={isPolishing}
          >
            <Copy className="mr-2 h-4 w-4" />
            Paste from Clipboard
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          onClick={onPolish}
          disabled={isPolishing || !canPolish}
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
        {creditsRemaining === 0 && (
          <p className="text-sm text-destructive">
            No credits remaining. Please upgrade your plan.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
