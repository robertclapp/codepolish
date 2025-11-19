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
  preset: z.enum(["quick", "standard", "thorough", "security", "performance"]).optional(),
  rules: z.object({
    accessibility: z.boolean(),
    security: z.boolean(),
    performance: z.boolean(),
    documentation: z.boolean(),
    testing: z.boolean(),
    componentSplitting: z.boolean(),
    typeAnnotations: z.boolean(),
    errorHandling: z.boolean(),
    codeStyle: z.boolean(),
  }).optional(),
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

// Polish rules configuration
export const PolishRulesSchema = z.object({
  accessibility: z.boolean().default(true),
  security: z.boolean().default(true),
  performance: z.boolean().default(true),
  documentation: z.boolean().default(true),
  testing: z.boolean().default(false),
  componentSplitting: z.boolean().default(false),
  typeAnnotations: z.boolean().default(true),
  errorHandling: z.boolean().default(true),
  codeStyle: z.boolean().default(true),
});
export type PolishRules = z.infer<typeof PolishRulesSchema>;

// Polish preset configurations
export const PolishPresetSchema = z.enum([
  "quick",
  "standard",
  "thorough",
  "security",
  "performance"
]);
export type PolishPreset = z.infer<typeof PolishPresetSchema>;

export const POLISH_PRESETS: Record<PolishPreset, PolishRules> = {
  quick: {
    accessibility: false,
    security: false,
    performance: false,
    documentation: false,
    testing: false,
    componentSplitting: false,
    typeAnnotations: true,
    errorHandling: true,
    codeStyle: true,
  },
  standard: {
    accessibility: true,
    security: true,
    performance: true,
    documentation: true,
    testing: false,
    componentSplitting: false,
    typeAnnotations: true,
    errorHandling: true,
    codeStyle: true,
  },
  thorough: {
    accessibility: true,
    security: true,
    performance: true,
    documentation: true,
    testing: true,
    componentSplitting: true,
    typeAnnotations: true,
    errorHandling: true,
    codeStyle: true,
  },
  security: {
    accessibility: false,
    security: true,
    performance: false,
    documentation: false,
    testing: false,
    componentSplitting: false,
    typeAnnotations: true,
    errorHandling: true,
    codeStyle: false,
  },
  performance: {
    accessibility: false,
    security: false,
    performance: true,
    documentation: false,
    testing: false,
    componentSplitting: true,
    typeAnnotations: true,
    errorHandling: false,
    codeStyle: false,
  },
};

// Learning suggestion schema
export const LearningSuggestionSchema = z.object({
  id: z.string(),
  category: z.enum(["pattern", "bestPractice", "antiPattern", "tip"]),
  title: z.string(),
  description: z.string(),
  codeExample: z.string().optional(),
  learnMoreUrl: z.string().optional(),
  severity: z.enum(["info", "warning", "error"]),
});
export type LearningSuggestion = z.infer<typeof LearningSuggestionSchema>;

// Quality trend data point
export const QualityDataPointSchema = z.object({
  date: z.date(),
  averageScore: z.number(),
  totalPolishes: z.number(),
  issuesFixed: z.number(),
});
export type QualityDataPoint = z.infer<typeof QualityDataPointSchema>;

// Team workspace schema
export const TeamWorkspaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.number(),
  createdAt: z.date(),
  memberCount: z.number(),
  totalPolishes: z.number(),
});
export type TeamWorkspace = z.infer<typeof TeamWorkspaceSchema>;

// API key schema
export const ApiKeySchema = z.object({
  id: z.number(),
  name: z.string(),
  keyPrefix: z.string(),
  lastUsed: z.date().nullable(),
  createdAt: z.date(),
  expiresAt: z.date().nullable(),
});
export type ApiKey = z.infer<typeof ApiKeySchema>;

// Generated test schema
export const GeneratedTestSchema = z.object({
  filename: z.string(),
  content: z.string(),
  framework: z.enum(["jest", "vitest", "mocha"]),
  coverage: z.object({
    statements: z.number(),
    branches: z.number(),
    functions: z.number(),
    lines: z.number(),
  }),
});
export type GeneratedTest = z.infer<typeof GeneratedTestSchema>;

// GitHub export schema
export const GitHubExportInputSchema = z.object({
  polishId: z.number(),
  repositoryUrl: z.string().url(),
  branch: z.string().default("main"),
  commitMessage: z.string().optional(),
  createPR: z.boolean().default(false),
});
export type GitHubExportInput = z.infer<typeof GitHubExportInputSchema>;
