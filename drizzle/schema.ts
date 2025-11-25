import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Polishes table - stores code polish jobs
 */
export const polishes = mysqlTable("polishes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  framework: varchar("framework", { length: 32 }).notNull(), // react, vue, svelte
  originalCode: text("originalCode").notNull(),
  polishedCode: text("polishedCode"),
  qualityScoreBefore: int("qualityScoreBefore"),
  qualityScoreAfter: int("qualityScoreAfter"),
  issuesFound: text("issuesFound"), // JSON array of issues
  improvementsSummary: text("improvementsSummary"), // JSON summary of changes
  status: mysqlEnum("status", ["pending", "analyzing", "polishing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  processingTime: int("processingTime"), // milliseconds
  creditsUsed: int("creditsUsed").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("polishes_userId_idx").on(table.userId),
  index("polishes_status_idx").on(table.status),
  index("polishes_userId_createdAt_idx").on(table.userId, table.createdAt),
]);

export type Polish = typeof polishes.$inferSelect;
export type InsertPolish = typeof polishes.$inferInsert;

/**
 * Subscriptions table - stores user subscription information
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  plan: mysqlEnum("plan", ["free", "pro", "team", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  creditsRemaining: int("creditsRemaining").default(5).notNull(), // Free tier gets 5/month
  creditsTotal: int("creditsTotal").default(5).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  periodStart: timestamp("periodStart").defaultNow().notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("subscriptions_stripeCustomerId_idx").on(table.stripeCustomerId),
  index("subscriptions_status_idx").on(table.status),
  index("subscriptions_periodEnd_idx").on(table.periodEnd),
]);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;