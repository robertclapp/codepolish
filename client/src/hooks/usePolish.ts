import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export type PolishStatus = "idle" | "analyzing" | "polishing" | "completed" | "failed";

export type PolishResult = {
  id: number;
  status: PolishStatus;
  qualityScoreBefore: number | null;
  qualityScoreAfter: number | null;
  issuesFound: Array<{
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  improvementsSummary: {
    designTokensExtracted?: number;
    componentsCreated?: number;
    typesAdded?: number;
    accessibilityFixes?: number;
    errorHandlingAdded?: boolean;
    documentationAdded?: boolean;
  } | null;
  polishedCode: string | null;
  processingTime: number | null;
};

export type Framework = "react" | "vue" | "svelte";

export function usePolish() {
  const utils = trpc.useUtils();
  const [currentPolish, setCurrentPolish] = useState<PolishResult | null>(null);
  const [status, setStatus] = useState<PolishStatus>("idle");

  const createPolishMutation = trpc.polish.create.useMutation({
    onSuccess: (data) => {
      setCurrentPolish({
        id: data.id,
        status: data.status as PolishStatus,
        qualityScoreBefore: data.qualityScoreBefore,
        qualityScoreAfter: data.qualityScoreAfter,
        issuesFound: data.issuesFound.map((issue) => ({
          ...issue,
          severity: issue.severity as "low" | "medium" | "high",
        })),
        improvementsSummary: data.improvementsSummary,
        polishedCode: data.polishedCode,
        processingTime: data.processingTime,
      });
      setStatus("completed");
      toast.success("Code polished successfully!");
      utils.polish.list.invalidate();
      utils.subscription.current.invalidate();
      utils.subscription.usage.invalidate();
    },
    onError: (error) => {
      setStatus("failed");
      toast.error(error.message || "Failed to polish code");
    },
  });

  const polishListQuery = trpc.polish.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: true }
  );

  const deletePolishMutation = trpc.polish.delete.useMutation({
    onSuccess: () => {
      toast.success("Polish deleted");
      utils.polish.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete polish");
    },
  });

  const polish = useCallback(
    async (name: string, code: string, framework: Framework) => {
      setStatus("analyzing");
      setCurrentPolish(null);

      try {
        await createPolishMutation.mutateAsync({
          name,
          code,
          framework,
        });
      } catch {
        // Error handled in onError callback
      }
    },
    [createPolishMutation]
  );

  const deletePolish = useCallback(
    async (id: number) => {
      await deletePolishMutation.mutateAsync({ id });
    },
    [deletePolishMutation]
  );

  const reset = useCallback(() => {
    setCurrentPolish(null);
    setStatus("idle");
  }, []);

  return {
    polish,
    deletePolish,
    reset,
    currentPolish,
    status,
    isPolishing: status === "analyzing" || status === "polishing",
    polishes: polishListQuery.data?.polishes ?? [],
    polishesLoading: polishListQuery.isLoading,
    totalPolishes: polishListQuery.data?.total ?? 0,
  };
}
