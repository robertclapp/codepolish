import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  polishes, InsertPolish,
  subscriptions, InsertSubscription
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

export async function getUserPolishes(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(polishes)
    .where(eq(polishes.userId, userId))
    .limit(limit);
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

export async function deductCredits(userId: number, amount: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const subscription = await getUserSubscription(userId);
  if (!subscription) throw new Error("No subscription found");
  if (subscription.creditsRemaining < amount) throw new Error("Insufficient credits");
  
  return await db.update(subscriptions)
    .set({ creditsRemaining: subscription.creditsRemaining - amount })
    .where(eq(subscriptions.userId, userId));
}

export async function refundCredits(userId: number, amount: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const subscription = await getUserSubscription(userId);
  if (!subscription) throw new Error("No subscription found");
  
  return await db.update(subscriptions)
    .set({ creditsRemaining: subscription.creditsRemaining + amount })
    .where(eq(subscriptions.userId, userId));
}
