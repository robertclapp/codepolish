import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Columns2, FileText, Plus, Minus, Equal } from "lucide-react";

interface CodeDiffViewerProps {
  originalCode: string;
  polishedCode: string;
  language?: string;
}

interface DiffLine {
  type: "add" | "remove" | "unchanged";
  content: string;
  lineNumber: {
    old?: number;
    new?: number;
  };
}

/**
 * Compute a simple line-by-line diff between two texts
 */
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const diff: DiffLine[] = [];

  // Use LCS (Longest Common Subsequence) approach for better diffs
  const lcs = computeLCS(oldLines, newLines);

  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (lcsIdx < lcs.length && oldIdx < oldLines.length && newIdx < newLines.length) {
      // Check if current lines match LCS
      if (oldLines[oldIdx] === lcs[lcsIdx] && newLines[newIdx] === lcs[lcsIdx]) {
        diff.push({
          type: "unchanged",
          content: oldLines[oldIdx],
          lineNumber: { old: oldIdx + 1, new: newIdx + 1 },
        });
        oldIdx++;
        newIdx++;
        lcsIdx++;
      } else if (oldLines[oldIdx] !== lcs[lcsIdx]) {
        diff.push({
          type: "remove",
          content: oldLines[oldIdx],
          lineNumber: { old: oldIdx + 1 },
        });
        oldIdx++;
      } else {
        diff.push({
          type: "add",
          content: newLines[newIdx],
          lineNumber: { new: newIdx + 1 },
        });
        newIdx++;
      }
    } else if (oldIdx < oldLines.length) {
      diff.push({
        type: "remove",
        content: oldLines[oldIdx],
        lineNumber: { old: oldIdx + 1 },
      });
      oldIdx++;
    } else if (newIdx < newLines.length) {
      diff.push({
        type: "add",
        content: newLines[newIdx],
        lineNumber: { new: newIdx + 1 },
      });
      newIdx++;
    }
  }

  return diff;
}

/**
 * Compute Longest Common Subsequence of two arrays
 */
function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

export function CodeDiffViewer({
  originalCode,
  polishedCode,
  language = "tsx",
}: CodeDiffViewerProps) {
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");

  const diff = useMemo(
    () => computeDiff(originalCode, polishedCode),
    [originalCode, polishedCode]
  );

  const stats = useMemo(() => {
    const additions = diff.filter((d) => d.type === "add").length;
    const deletions = diff.filter((d) => d.type === "remove").length;
    const unchanged = diff.filter((d) => d.type === "unchanged").length;
    return { additions, deletions, unchanged };
  }, [diff]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">Code Changes</span>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-green-600 border-green-600 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              {stats.additions}
            </Badge>
            <Badge
              variant="outline"
              className="text-red-600 border-red-600 flex items-center gap-1"
            >
              <Minus className="h-3 w-3" />
              {stats.deletions}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Equal className="h-3 w-3" />
              {stats.unchanged}
            </Badge>
          </div>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="unified" className="h-6 px-2 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Unified
            </TabsTrigger>
            <TabsTrigger value="split" className="h-6 px-2 text-xs">
              <Columns2 className="h-3 w-3 mr-1" />
              Split
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Diff Content */}
      <ScrollArea className="h-[400px]">
        {viewMode === "unified" ? (
          <UnifiedDiffView diff={diff} />
        ) : (
          <SplitDiffView diff={diff} />
        )}
      </ScrollArea>
    </div>
  );
}

function UnifiedDiffView({ diff }: { diff: DiffLine[] }) {
  return (
    <div className="font-mono text-xs">
      {diff.map((line, idx) => (
        <div
          key={idx}
          className={`flex ${
            line.type === "add"
              ? "bg-green-500/10"
              : line.type === "remove"
              ? "bg-red-500/10"
              : ""
          }`}
        >
          <div className="w-12 flex-shrink-0 text-muted-foreground text-right pr-2 select-none border-r">
            {line.lineNumber.old || ""}
          </div>
          <div className="w-12 flex-shrink-0 text-muted-foreground text-right pr-2 select-none border-r">
            {line.lineNumber.new || ""}
          </div>
          <div className="w-6 flex-shrink-0 text-center select-none">
            {line.type === "add" ? (
              <span className="text-green-600">+</span>
            ) : line.type === "remove" ? (
              <span className="text-red-600">-</span>
            ) : (
              <span className="text-muted-foreground">&nbsp;</span>
            )}
          </div>
          <div className="flex-1 px-2 whitespace-pre overflow-x-auto">
            {line.content || " "}
          </div>
        </div>
      ))}
    </div>
  );
}

function SplitDiffView({ diff }: { diff: DiffLine[] }) {
  // Organize diff into side-by-side format
  const leftLines: (DiffLine | null)[] = [];
  const rightLines: (DiffLine | null)[] = [];

  let leftIdx = 0;
  let rightIdx = 0;

  for (const line of diff) {
    if (line.type === "unchanged") {
      // Pad to align
      while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
        if (leftIdx < leftLines.length && rightLines.length <= rightIdx) {
          rightLines.push(null);
          rightIdx++;
        } else if (rightIdx < rightLines.length && leftLines.length <= leftIdx) {
          leftLines.push(null);
          leftIdx++;
        } else {
          break;
        }
      }
      leftLines.push(line);
      rightLines.push(line);
      leftIdx++;
      rightIdx++;
    } else if (line.type === "remove") {
      leftLines.push(line);
      leftIdx++;
    } else {
      rightLines.push(line);
      rightIdx++;
    }
  }

  // Pad to equal length
  while (leftLines.length < rightLines.length) {
    leftLines.push(null);
  }
  while (rightLines.length < leftLines.length) {
    rightLines.push(null);
  }

  return (
    <div className="font-mono text-xs flex">
      {/* Left side (original) */}
      <div className="flex-1 border-r">
        <div className="text-center py-1 bg-muted/30 border-b text-muted-foreground">
          Original
        </div>
        {leftLines.map((line, idx) => (
          <div
            key={idx}
            className={`flex ${
              line?.type === "remove" ? "bg-red-500/10" : ""
            } ${!line ? "bg-muted/20" : ""}`}
          >
            <div className="w-10 flex-shrink-0 text-muted-foreground text-right pr-2 select-none border-r">
              {line?.lineNumber.old || ""}
            </div>
            <div className="flex-1 px-2 whitespace-pre overflow-x-auto">
              {line?.content || " "}
            </div>
          </div>
        ))}
      </div>

      {/* Right side (polished) */}
      <div className="flex-1">
        <div className="text-center py-1 bg-muted/30 border-b text-muted-foreground">
          Polished
        </div>
        {rightLines.map((line, idx) => (
          <div
            key={idx}
            className={`flex ${
              line?.type === "add" ? "bg-green-500/10" : ""
            } ${!line ? "bg-muted/20" : ""}`}
          >
            <div className="w-10 flex-shrink-0 text-muted-foreground text-right pr-2 select-none border-r">
              {line?.lineNumber.new || ""}
            </div>
            <div className="flex-1 px-2 whitespace-pre overflow-x-auto">
              {line?.content || " "}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CodeDiffViewer;
