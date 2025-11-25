import { eq, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, User,
  polishes, InsertPolish, Polish,
  subscriptions, InsertSubscription, Subscription
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Database error types for better error handling
 */
export class DatabaseError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class InsufficientCreditsError extends DatabaseError {
  constructor(available: number, required: number) {
    super(`Insufficient credits: ${available} available, ${required} required`, 'INSUFFICIENT_CREDITS');
  }
}

export class SubscriptionNotFoundError extends DatabaseError {
  constructor(userId: number) {
    super(`No subscription found for user ${userId}`, 'SUBSCRIPTION_NOT_FOUND');
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Polish queries
 */
export async function createPolish(data: InsertPolish) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(polishes).values(data);
  return result;
}

export async function getUserPolishes(userId: number, limit: number = 50, offset: number = 0): Promise<Polish[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(polishes)
    .where(eq(polishes.userId, userId))
    .orderBy(desc(polishes.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPolishById(polishId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(polishes).where(eq(polishes.id, polishId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePolish(polishId: number, data: Partial<InsertPolish>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(polishes).set(data).where(eq(polishes.id, polishId));
}

export async function deletePolish(polishId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(polishes).where(eq(polishes.id, polishId));
}

/**
 * Subscription queries
 */
export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(subscriptions).values(data);
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubscription(userId: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
}

/**
 * Atomically deduct credits from a user's subscription.
 * Uses SQL-level comparison to prevent race conditions.
 * @throws {InsufficientCreditsError} if user doesn't have enough credits
 * @throws {SubscriptionNotFoundError} if subscription doesn't exist
 */
export async function deductCredits(userId: number, amount: number = 1): Promise<{ creditsRemaining: number }> {
  const db = await getDb();
  if (!db) throw new DatabaseError("Database not available", "DB_UNAVAILABLE");

  if (amount <= 0) {
    throw new DatabaseError("Amount must be positive", "INVALID_AMOUNT");
  }

  // Use atomic SQL operation to prevent race conditions
  const result = await db.update(subscriptions)
    .set({
      creditsRemaining: sql`GREATEST(${subscriptions.creditsRemaining} - ${amount}, 0)`,
    })
    .where(
      sql`${subscriptions.userId} = ${userId} AND ${subscriptions.creditsRemaining} >= ${amount}`
    );

  // Check if the update affected any rows
  const affectedRows = (result as any)[0]?.affectedRows ?? 0;

  if (affectedRows === 0) {
    // Check if subscription exists
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      throw new SubscriptionNotFoundError(userId);
    }
    // Subscription exists but insufficient credits
    throw new InsufficientCreditsError(subscription.creditsRemaining, amount);
  }

  // Get updated subscription to return new balance
  const updated = await getUserSubscription(userId);
  return { creditsRemaining: updated?.creditsRemaining ?? 0 };
}

/**
 * Atomically refund credits to a user's subscription.
 * Ensures credits don't exceed the total allowed.
 * @throws {SubscriptionNotFoundError} if subscription doesn't exist
 */
export async function refundCredits(userId: number, amount: number = 1): Promise<{ creditsRemaining: number }> {
  const db = await getDb();
  if (!db) throw new DatabaseError("Database not available", "DB_UNAVAILABLE");

  if (amount <= 0) {
    throw new DatabaseError("Amount must be positive", "INVALID_AMOUNT");
  }

  // Atomic update that caps at creditsTotal
  const result = await db.update(subscriptions)
    .set({
      creditsRemaining: sql`LEAST(${subscriptions.creditsRemaining} + ${amount}, ${subscriptions.creditsTotal})`,
    })
    .where(eq(subscriptions.userId, userId));

  const affectedRows = (result as any)[0]?.affectedRows ?? 0;

  if (affectedRows === 0) {
    throw new SubscriptionNotFoundError(userId);
  }

  const updated = await getUserSubscription(userId);
  return { creditsRemaining: updated?.creditsRemaining ?? 0 };
}

/**
 * Check if user has sufficient credits for an operation
 */
export async function hasCredits(userId: number, amount: number = 1): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;
  return subscription.creditsRemaining >= amount;
}

/**
 * Get the count of polishes for a user
 */
export async function getPolishCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(polishes)
    .where(eq(polishes.userId, userId));

  return result[0]?.count ?? 0;
}
