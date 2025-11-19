import { z } from "zod";

// Framework enum
export const FrameworkSchema = z.enum(["react", "vue", "svelte"]);
export type Framework = z.infer<typeof FrameworkSchema>;

// Polish status enum
export const PolishStatusSchema = z.enum([
  "pending",
  "analyzing",
  "polishing",
  "completed",
  "failed",
]);
export type PolishStatus = z.infer<typeof PolishStatusSchema>;

// Subscription plan enum
export const SubscriptionPlanSchema = z.enum([
  "free",
  "pro",
  "team",
  "enterprise",
]);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

// Subscription status enum
export const SubscriptionStatusSchema = z.enum([
  "active",
  "cancelled",
  "expired",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

// Polish input schemas
export const CreatePolishInputSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  framework: FrameworkSchema,
  originalCode: z
    .string()
    .min(1, "Code is required")
    .max(500000, "Code must be less than 500KB"),
});
export type CreatePolishInput = z.infer<typeof CreatePolishInputSchema>;

export const UpdatePolishInputSchema = z.object({
  polishId: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  polishedCode: z.string().optional(),
  qualityScoreBefore: z.number().int().min(0).max(100).optional(),
  qualityScoreAfter: z.number().int().min(0).max(100).optional(),
  issuesFound: z.array(z.string()).optional(),
  improvementsSummary: z.record(z.string(), z.unknown()).optional(),
  status: PolishStatusSchema.optional(),
  errorMessage: z.string().optional(),
  processingTime: z.number().int().positive().optional(),
});
export type UpdatePolishInput = z.infer<typeof UpdatePolishInputSchema>;

export const GetPolishInputSchema = z.object({
  polishId: z.number().int().positive(),
});
export type GetPolishInput = z.infer<typeof GetPolishInputSchema>;

export const ListPolishesInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  status: PolishStatusSchema.optional(),
});
export type ListPolishesInput = z.infer<typeof ListPolishesInputSchema>;

export const DeletePolishInputSchema = z.object({
  polishId: z.number().int().positive(),
});
export type DeletePolishInput = z.infer<typeof DeletePolishInputSchema>;

// Subscription schemas
export const UpdateSubscriptionInputSchema = z.object({
  plan: SubscriptionPlanSchema.optional(),
  status: SubscriptionStatusSchema.optional(),
  creditsRemaining: z.number().int().min(0).optional(),
  creditsTotal: z.number().int().min(0).optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});
export type UpdateSubscriptionInput = z.infer<
  typeof UpdateSubscriptionInputSchema
>;

// Issue schema for polish results
export const IssueSchema = z.object({
  type: z.enum([
    "security",
    "performance",
    "accessibility",
    "maintainability",
    "style",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  message: z.string(),
  line: z.number().optional(),
  suggestion: z.string().optional(),
});
export type Issue = z.infer<typeof IssueSchema>;

// Improvement summary schema
export const ImprovementSummarySchema = z.object({
  tokensExtracted: z.number().int().min(0),
  componentsCreated: z.number().int().min(0),
  typesAdded: z.number().int().min(0),
  accessibilityFixes: z.number().int().min(0),
  securityFixes: z.number().int().min(0),
  performanceImprovements: z.number().int().min(0),
  documentationAdded: z.boolean(),
  testsGenerated: z.boolean(),
});
export type ImprovementSummary = z.infer<typeof ImprovementSummarySchema>;

// Polish response schema (what we return from API)
export const PolishResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  framework: FrameworkSchema,
  originalCode: z.string(),
  polishedCode: z.string().nullable(),
  qualityScoreBefore: z.number().nullable(),
  qualityScoreAfter: z.number().nullable(),
  issuesFound: z.array(IssueSchema).nullable(),
  improvementsSummary: ImprovementSummarySchema.nullable(),
  status: PolishStatusSchema,
  errorMessage: z.string().nullable(),
  processingTime: z.number().nullable(),
  creditsUsed: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type PolishResponse = z.infer<typeof PolishResponseSchema>;

// Subscription response schema
export const SubscriptionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  plan: SubscriptionPlanSchema,
  status: SubscriptionStatusSchema,
  creditsRemaining: z.number(),
  creditsTotal: z.number(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  periodStart: z.date(),
  periodEnd: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;

// Pagination response wrapper
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  });

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};
