import { TRPCError } from "@trpc/server";
import * as db from "../db";
import {
  CreatePolishInput,
  Issue,
  ImprovementSummary,
  PolishResponse,
  PaginatedResponse,
  PolishStatus,
} from "@shared/schemas";
import type { Polish, InsertPolish } from "../../drizzle/schema";

/**
 * Service layer for polish operations
 * Handles business logic and data transformation
 */
export class PolishService {
  /**
   * Create a new polish job
   */
  async createPolish(
    userId: number,
    input: CreatePolishInput
  ): Promise<PolishResponse> {
    // Check user has credits
    const subscription = await db.getUserSubscription(userId);
    if (!subscription) {
      // Create default free subscription
      await db.createSubscription({
        userId,
        plan: "free",
        creditsRemaining: 5,
        creditsTotal: 5,
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } else if (subscription.creditsRemaining < 1) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Insufficient credits. Please upgrade your plan.",
      });
    }

    // Create the polish record
    const polishData: InsertPolish = {
      userId,
      name: input.name,
      framework: input.framework,
      originalCode: input.originalCode,
      status: "pending",
      creditsUsed: 1,
    };

    const result = await db.createPolish(polishData);
    const polishId = Number(result.insertId);

    // Deduct credits
    await db.deductCredits(userId, 1);

    // Get the created polish
    const polish = await db.getPolishById(polishId);
    if (!polish) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create polish",
      });
    }

    return this.transformPolish(polish);
  }

  /**
   * Get a polish by ID with ownership check
   */
  async getPolish(userId: number, polishId: number): Promise<PolishResponse> {
    const polish = await db.getPolishById(polishId);

    if (!polish) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Polish not found",
      });
    }

    if (polish.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to view this polish",
      });
    }

    return this.transformPolish(polish);
  }

  /**
   * List polishes for a user with pagination
   */
  async listPolishes(
    userId: number,
    limit: number = 50,
    offset: number = 0,
    status?: PolishStatus
  ): Promise<PaginatedResponse<PolishResponse>> {
    const polishes = await db.getUserPolishes(userId, limit + 1, offset, status);

    const hasMore = polishes.length > limit;
    const items = polishes.slice(0, limit);

    return {
      items: items.map((p) => this.transformPolish(p)),
      total: items.length, // Ideally we'd have a count query
      limit,
      offset,
      hasMore,
    };
  }

  /**
   * Update a polish (used by the processing pipeline)
   */
  async updatePolish(
    userId: number,
    polishId: number,
    updates: Partial<{
      polishedCode: string;
      qualityScoreBefore: number;
      qualityScoreAfter: number;
      issuesFound: Issue[];
      improvementsSummary: ImprovementSummary;
      status: PolishStatus;
      errorMessage: string;
      processingTime: number;
    }>
  ): Promise<PolishResponse> {
    // Verify ownership
    const polish = await db.getPolishById(polishId);
    if (!polish) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Polish not found",
      });
    }

    if (polish.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to update this polish",
      });
    }

    // Transform for database
    const dbUpdates: Partial<InsertPolish> = {
      ...updates,
      issuesFound: updates.issuesFound
        ? JSON.stringify(updates.issuesFound)
        : undefined,
      improvementsSummary: updates.improvementsSummary
        ? JSON.stringify(updates.improvementsSummary)
        : undefined,
    };

    await db.updatePolish(polishId, dbUpdates);

    const updated = await db.getPolishById(polishId);
    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update polish",
      });
    }

    return this.transformPolish(updated);
  }

  /**
   * Delete a polish with ownership check
   */
  async deletePolish(userId: number, polishId: number): Promise<void> {
    const polish = await db.getPolishById(polishId);

    if (!polish) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Polish not found",
      });
    }

    if (polish.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to delete this polish",
      });
    }

    await db.deletePolish(polishId);
  }

  /**
   * Process a polish job (runs the AI analysis)
   * This would typically be called by a background worker
   */
  async processPolish(polishId: number): Promise<PolishResponse> {
    const polish = await db.getPolishById(polishId);
    if (!polish) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Polish not found",
      });
    }

    const startTime = Date.now();

    try {
      // Update status to analyzing
      await db.updatePolish(polishId, { status: "analyzing" });

      // Analyze code quality
      const qualityScoreBefore = await this.analyzeCodeQuality(
        polish.originalCode
      );
      const issues = await this.findIssues(polish.originalCode, polish.framework);

      // Update status to polishing
      await db.updatePolish(polishId, {
        status: "polishing",
        qualityScoreBefore,
        issuesFound: JSON.stringify(issues),
      });

      // Polish the code
      const { polishedCode, improvements } = await this.polishCode(
        polish.originalCode,
        polish.framework,
        issues
      );

      // Analyze polished code
      const qualityScoreAfter = await this.analyzeCodeQuality(polishedCode);

      const processingTime = Date.now() - startTime;

      // Update with final results
      await db.updatePolish(polishId, {
        status: "completed",
        polishedCode,
        qualityScoreAfter,
        improvementsSummary: JSON.stringify(improvements),
        processingTime,
      });

      const updated = await db.getPolishById(polishId);
      return this.transformPolish(updated!);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      await db.updatePolish(polishId, {
        status: "failed",
        errorMessage,
        processingTime,
      });

      // Refund credits on failure
      await db.refundCredits(polish.userId, 1);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Polish processing failed: ${errorMessage}`,
      });
    }
  }

  /**
   * Analyze code quality and return a score 0-100
   */
  private async analyzeCodeQuality(code: string): Promise<number> {
    // Basic heuristic analysis (would be replaced with AI in production)
    let score = 50;

    // Check for TypeScript types
    if (code.includes(": string") || code.includes(": number") || code.includes("interface ") || code.includes("type ")) {
      score += 10;
    }

    // Check for documentation
    if (code.includes("/**") || code.includes("@param") || code.includes("@returns")) {
      score += 10;
    }

    // Check for accessibility
    if (code.includes("aria-") || code.includes("role=")) {
      score += 10;
    }

    // Check for error handling
    if (code.includes("try {") || code.includes("catch (") || code.includes(".catch(")) {
      score += 10;
    }

    // Penalize inline styles
    if (code.includes('style={{') || code.includes('style="')) {
      score -= 10;
    }

    // Penalize magic numbers
    const magicNumbers = code.match(/\b\d{2,}\b/g);
    if (magicNumbers && magicNumbers.length > 5) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Find issues in the code
   */
  private async findIssues(code: string, framework: string): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Check for inline styles
    if (code.includes('style={{') || code.includes('style="')) {
      issues.push({
        type: "maintainability",
        severity: "medium",
        message: "Inline styles detected - consider using CSS classes or styled components",
        suggestion: "Extract styles to a separate stylesheet or use CSS-in-JS solution",
      });
    }

    // Check for missing alt text
    if (code.includes("<img") && !code.includes("alt=")) {
      issues.push({
        type: "accessibility",
        severity: "high",
        message: "Images missing alt text",
        suggestion: "Add descriptive alt text to all images",
      });
    }

    // Check for console.log
    if (code.includes("console.log")) {
      issues.push({
        type: "maintainability",
        severity: "low",
        message: "console.log statements found",
        suggestion: "Remove debug statements before production",
      });
    }

    // Check for any type
    if (code.includes(": any") || code.includes("<any>")) {
      issues.push({
        type: "maintainability",
        severity: "medium",
        message: "TypeScript 'any' type usage detected",
        suggestion: "Replace 'any' with specific types for better type safety",
      });
    }

    // Check for innerHTML (XSS risk)
    if (code.includes("innerHTML") || code.includes("dangerouslySetInnerHTML")) {
      issues.push({
        type: "security",
        severity: "critical",
        message: "Potential XSS vulnerability - innerHTML usage detected",
        suggestion: "Sanitize content or use safe alternatives",
      });
    }

    // Check for missing error handling in async
    if ((code.includes("async ") || code.includes(".then(")) && !code.includes("catch")) {
      issues.push({
        type: "maintainability",
        severity: "medium",
        message: "Async operations without error handling",
        suggestion: "Add try-catch blocks or .catch() handlers",
      });
    }

    return issues;
  }

  /**
   * Polish the code and return improvements
   */
  private async polishCode(
    code: string,
    framework: string,
    issues: Issue[]
  ): Promise<{ polishedCode: string; improvements: ImprovementSummary }> {
    // In production, this would call an AI service
    // For now, return the original code with mock improvements
    let polishedCode = code;

    // Simple transformations
    // Remove console.log statements
    polishedCode = polishedCode.replace(/console\.log\([^)]*\);?\n?/g, "");

    // Add basic type annotations if missing
    if (!polishedCode.includes(": React.FC") && framework === "react") {
      polishedCode = polishedCode.replace(
        /export default function (\w+)\(\)/,
        "export default function $1(): JSX.Element"
      );
    }

    const improvements: ImprovementSummary = {
      tokensExtracted: 0,
      componentsCreated: 0,
      typesAdded: code.includes(": any") ? 3 : 0,
      accessibilityFixes: issues.filter((i) => i.type === "accessibility").length,
      securityFixes: issues.filter((i) => i.type === "security").length,
      performanceImprovements: 0,
      documentationAdded: !code.includes("/**"),
      testsGenerated: false,
    };

    return { polishedCode, improvements };
  }

  /**
   * Transform database polish to API response
   */
  private transformPolish(polish: Polish): PolishResponse {
    return {
      id: polish.id,
      userId: polish.userId,
      name: polish.name,
      framework: polish.framework as "react" | "vue" | "svelte",
      originalCode: polish.originalCode,
      polishedCode: polish.polishedCode,
      qualityScoreBefore: polish.qualityScoreBefore,
      qualityScoreAfter: polish.qualityScoreAfter,
      issuesFound: polish.issuesFound
        ? JSON.parse(polish.issuesFound)
        : null,
      improvementsSummary: polish.improvementsSummary
        ? JSON.parse(polish.improvementsSummary)
        : null,
      status: polish.status as PolishStatus,
      errorMessage: polish.errorMessage,
      processingTime: polish.processingTime,
      creditsUsed: polish.creditsUsed,
      createdAt: polish.createdAt,
      updatedAt: polish.updatedAt,
    };
  }
}

// Export singleton instance
export const polishService = new PolishService();
