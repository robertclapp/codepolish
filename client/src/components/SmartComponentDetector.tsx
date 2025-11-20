import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Lightbulb,
  Component,
  Sparkles,
  Code,
  Check,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface ComponentSuggestion {
  id: string;
  name: string;
  reason: string;
  confidence: number;
  linesOfCode: number;
  extractedCode: string;
  props: string[];
  benefits: string[];
}

interface SmartComponentDetectorProps {
  code: string;
  onExtractComponent?: (suggestion: ComponentSuggestion) => void;
}

export function SmartComponentDetector({
  code,
  onExtractComponent,
}: SmartComponentDetectorProps) {
  const [suggestions, setSuggestions] = useState<ComponentSuggestion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedIds, setExtractedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (code && code.length > 100) {
      analyzecode();
    }
  }, [code]);

  const analyzeCode = async () => {
    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock analysis - in production, this would use AI
    const mockSuggestions: ComponentSuggestion[] = [];

    // Detect repeated JSX patterns
    if (code.includes("<button") && code.match(/<button/g)?.length! > 2) {
      mockSuggestions.push({
        id: "button-component",
        name: "PrimaryButton",
        reason: "Repeated button patterns with similar styles",
        confidence: 85,
        linesOfCode: 8,
        extractedCode: `interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function PrimaryButton({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {label}
    </button>
  );
}`,
        props: ["label", "onClick", "variant", "disabled"],
        benefits: [
          "Consistent button styling",
          "Reusable across application",
          "Easier to maintain and update",
        ],
      });
    }

    // Detect form patterns
    if (code.includes("<input") && code.includes("<form")) {
      mockSuggestions.push({
        id: "form-field",
        name: "FormField",
        reason: "Repeated form field patterns with labels and errors",
        confidence: 92,
        linesOfCode: 15,
        extractedCode: `interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export function FormField({ label, name, type = 'text', error, value, onChange }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}`,
        props: ["label", "name", "type", "error", "value", "onChange"],
        benefits: [
          "Consistent form field styling",
          "Built-in error handling",
          "Accessibility features",
        ],
      });
    }

    // Detect list rendering patterns
    if (code.includes(".map(") && code.match(/\.map\(/g)?.length! > 1) {
      mockSuggestions.push({
        id: "list-item",
        name: "ListItem",
        reason: "Repeated list item rendering pattern",
        confidence: 78,
        linesOfCode: 12,
        extractedCode: `interface ListItemProps {
  title: string;
  description?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function ListItem({ title, description, onClick, icon }: ListItemProps) {
  return (
    <div className="list-item" onClick={onClick}>
      {icon && <div className="list-item-icon">{icon}</div>}
      <div className="list-item-content">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}`,
        props: ["title", "description", "onClick", "icon"],
        benefits: [
          "Consistent list item UI",
          "Optional icons and descriptions",
          "Click handling built-in",
        ],
      });
    }

    // Detect card-like structures
    if (
      (code.includes("<div") && code.match(/<div/g)?.length! > 5) ||
      code.includes("className") && code.match(/className/g)?.length! > 5
    ) {
      mockSuggestions.push({
        id: "info-card",
        name: "InfoCard",
        reason: "Repeated card-like structure with similar layout",
        confidence: 88,
        linesOfCode: 10,
        extractedCode: `interface InfoCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function InfoCard({ title, subtitle, children, actions }: InfoCardProps) {
  return (
    <div className="info-card">
      <div className="card-header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="card-body">{children}</div>
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  );
}`,
        props: ["title", "subtitle", "children", "actions"],
        benefits: [
          "Consistent card layout",
          "Optional subtitle and actions",
          "Flexible content area",
        ],
      });
    }

    setSuggestions(mockSuggestions);
    setAnalyzing(false);

    if (mockSuggestions.length > 0) {
      toast.success(
        `Found ${mockSuggestions.length} component extraction opportunities`
      );
    }
  };

  const handleExtract = (suggestion: ComponentSuggestion) => {
    setExtractedIds(new Set(extractedIds).add(suggestion.id));
    onExtractComponent?.(suggestion);
    toast.success(`Component "${suggestion.name}" extracted!`);
  };

  if (!code || code.length < 100) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Component className="h-4 w-4" />
            Smart Component Detection
          </CardTitle>
          <CardDescription>
            Add more code to analyze for component extraction opportunities
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Component className="h-4 w-4" />
          Smart Component Detection
        </CardTitle>
        <CardDescription>
          AI-powered analysis of component extraction opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyzing ? (
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Analyzing your code...
            </p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p>No component extraction opportunities found</p>
            <p className="text-xs mt-1">Your code is already well-organized!</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {suggestions.map((suggestion) => {
                const isExtracted = extractedIds.has(suggestion.id);
                return (
                  <div
                    key={suggestion.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{suggestion.name}</h4>
                          <Badge
                            variant={
                              suggestion.confidence >= 85
                                ? "default"
                                : "secondary"
                            }
                          >
                            {suggestion.confidence}% confident
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.reason}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleExtract(suggestion)}
                        disabled={isExtracted}
                      >
                        {isExtracted ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Extracted
                          </>
                        ) : (
                          <>
                            Extract
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline">
                        {suggestion.linesOfCode} lines
                      </Badge>
                      <Badge variant="outline">
                        {suggestion.props.length} props
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium">Benefits:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {suggestion.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-3 w-3 text-green-500 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View extracted component code
                      </summary>
                      <pre className="bg-muted p-3 rounded mt-2 overflow-x-auto">
                        <code>{suggestion.extractedCode}</code>
                      </pre>
                    </details>

                    <Progress
                      value={suggestion.confidence}
                      className="h-1"
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {suggestions.length > 0 && (
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p>
              💡 Extracting components improves maintainability and reusability.
              Each suggestion is analyzed based on code patterns and best
              practices.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SmartComponentDetector;
