import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import type { LearningSuggestion } from "@shared/schemas";

interface LearningSuggestionsProps {
  suggestions: LearningSuggestion[];
  loading?: boolean;
}

const CATEGORY_CONFIG = {
  pattern: {
    icon: CheckCircle2,
    label: "Design Pattern",
    color: "text-blue-500",
  },
  bestPractice: {
    icon: Lightbulb,
    label: "Best Practice",
    color: "text-green-500",
  },
  antiPattern: {
    icon: XCircle,
    label: "Anti-Pattern",
    color: "text-red-500",
  },
  tip: {
    icon: BookOpen,
    label: "Pro Tip",
    color: "text-purple-500",
  },
};

const SEVERITY_VARIANT = {
  info: "secondary",
  warning: "default",
  error: "destructive",
} as const;

export function LearningSuggestions({
  suggestions,
  loading,
}: LearningSuggestionsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Suggestions</CardTitle>
          <CardDescription>Analyzing your code patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Lightbulb className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Suggestions</CardTitle>
          <CardDescription>
            Educational insights from your code analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No suggestions yet</p>
            <p className="text-sm">
              Polish some code to get personalized learning suggestions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by category
  const grouped = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, LearningSuggestion[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Suggestions</CardTitle>
        <CardDescription>
          Improve your skills based on your code patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => {
          const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
          const Icon = config.icon;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span>{config.label}</span>
                <Badge variant="outline" className="ml-auto">
                  {items.length}
                </Badge>
              </div>

              <div className="space-y-2 pl-6">
                {items.map((suggestion) => (
                  <Collapsible
                    key={suggestion.id}
                    open={expandedIds.has(suggestion.id)}
                    onOpenChange={() => toggleExpanded(suggestion.id)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2 text-left">
                            <Badge variant={SEVERITY_VARIANT[suggestion.severity]}>
                              {suggestion.severity}
                            </Badge>
                            <span className="text-sm font-medium">
                              {suggestion.title}
                            </span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedIds.has(suggestion.id) ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 space-y-3 border-t pt-3">
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>

                          {suggestion.codeExample && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium">Example:</p>
                              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                                <code>{suggestion.codeExample}</code>
                              </pre>
                            </div>
                          )}

                          {suggestion.learnMoreUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="w-full"
                            >
                              <a
                                href={suggestion.learnMoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Learn More
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Generate mock suggestions for demonstration
export function generateMockSuggestions(): LearningSuggestion[] {
  return [
    {
      id: "1",
      category: "bestPractice",
      title: "Use React.memo for expensive components",
      description:
        "Your component re-renders frequently. Wrap it with React.memo() to prevent unnecessary re-renders when props haven't changed.",
      codeExample: `const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive render */}</div>
});`,
      learnMoreUrl: "https://react.dev/reference/react/memo",
      severity: "info",
    },
    {
      id: "2",
      category: "antiPattern",
      title: "Avoid inline function definitions in JSX",
      description:
        "Creating new functions on every render can cause unnecessary re-renders of child components. Extract handlers to useCallback.",
      codeExample: `// Bad
<Button onClick={() => handleClick(id)} />

// Good
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);
<Button onClick={handleButtonClick} />`,
      severity: "warning",
    },
    {
      id: "3",
      category: "pattern",
      title: "Implement Error Boundaries",
      description:
        "Your component tree doesn't have error boundaries. Add them to gracefully handle runtime errors.",
      severity: "error",
    },
    {
      id: "4",
      category: "tip",
      title: "Use TypeScript discriminated unions",
      description:
        "Instead of optional properties, use discriminated unions for better type safety and exhaustiveness checking.",
      codeExample: `type LoadingState =
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };`,
      severity: "info",
    },
  ];
}

export default LearningSuggestions;
