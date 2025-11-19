import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Shield,
  Zap,
  FileText,
  TestTube,
  Boxes,
  Type,
  AlertTriangle,
  Paintbrush,
  Accessibility,
  ChevronDown,
  Settings2,
} from "lucide-react";
import type { PolishRules, PolishPreset } from "@shared/schemas";
import { POLISH_PRESETS } from "@shared/schemas";

interface PolishRulesConfigProps {
  rules: PolishRules;
  onChange: (rules: PolishRules) => void;
  disabled?: boolean;
}

const RULE_CONFIG = [
  {
    key: "accessibility" as const,
    label: "Accessibility",
    description: "Add ARIA labels, semantic HTML, keyboard navigation",
    icon: Accessibility,
  },
  {
    key: "security" as const,
    label: "Security",
    description: "Fix XSS vulnerabilities, sanitize inputs, secure practices",
    icon: Shield,
  },
  {
    key: "performance" as const,
    label: "Performance",
    description: "Optimize renders, memoization, lazy loading",
    icon: Zap,
  },
  {
    key: "documentation" as const,
    label: "Documentation",
    description: "Add JSDoc comments, prop documentation",
    icon: FileText,
  },
  {
    key: "testing" as const,
    label: "Test Generation",
    description: "Generate unit tests for components",
    icon: TestTube,
    badge: "Pro",
  },
  {
    key: "componentSplitting" as const,
    label: "Component Splitting",
    description: "Split large components into smaller, reusable pieces",
    icon: Boxes,
    badge: "Pro",
  },
  {
    key: "typeAnnotations" as const,
    label: "Type Annotations",
    description: "Add TypeScript types and interfaces",
    icon: Type,
  },
  {
    key: "errorHandling" as const,
    label: "Error Handling",
    description: "Add try-catch blocks, error boundaries",
    icon: AlertTriangle,
  },
  {
    key: "codeStyle" as const,
    label: "Code Style",
    description: "Consistent formatting, naming conventions",
    icon: Paintbrush,
  },
];

export function PolishRulesConfig({
  rules,
  onChange,
  disabled = false,
}: PolishRulesConfigProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (preset: PolishPreset) => {
    onChange(POLISH_PRESETS[preset]);
  };

  const handleRuleToggle = (key: keyof PolishRules) => {
    onChange({
      ...rules,
      [key]: !rules[key],
    });
  };

  const activeRulesCount = Object.values(rules).filter(Boolean).length;
  const totalRules = Object.keys(rules).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Polish Rules</span>
            <Badge variant="secondary">
              {activeRulesCount}/{totalRules}
            </Badge>
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        {/* Preset selector */}
        <div className="space-y-2">
          <Label>Preset</Label>
          <Select
            onValueChange={handlePresetChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick">Quick - Basic fixes only</SelectItem>
              <SelectItem value="standard">Standard - Recommended</SelectItem>
              <SelectItem value="thorough">Thorough - Full analysis</SelectItem>
              <SelectItem value="security">Security Focus</SelectItem>
              <SelectItem value="performance">Performance Focus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Individual rules */}
        <div className="space-y-3 pt-2">
          {RULE_CONFIG.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.key}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={rule.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {rule.label}
                      </Label>
                      {rule.badge && (
                        <Badge variant="outline" className="text-xs">
                          {rule.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={rule.key}
                  checked={rules[rule.key]}
                  onCheckedChange={() => handleRuleToggle(rule.key)}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default PolishRulesConfig;
