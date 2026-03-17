import { redis } from "@/lib/redis";

const AI_CACHE_PREFIX = "ai:";

/**
 * Get a cached AI result from Redis.
 * Returns null if not found or if Redis fails (fallback-safe).
 */
export async function getAiCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<unknown>(`${AI_CACHE_PREFIX}${key}`);
    if (data == null) return null;

    // Backward compatibility: previously cached payloads may be stringified JSON.
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as T;
      }
    }

    return data as T;
  } catch (error) {
    console.error("Redis GET error (falling back):", error);
    return null;
  }
}

/**
 * Store an AI result in Redis with a TTL in seconds.
 * Silently fails if Redis is unavailable (never crashes the app).
 */
export async function setAiCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(`${AI_CACHE_PREFIX}${key}`, data, { ex: ttlSeconds });
  } catch (error) {
    console.error("Redis SET error (ignoring):", error);
  }
}

/**
 * Delete a single AI cache key.
 * Silently fails if Redis is unavailable.
 */
export async function deleteAiCache(key: string): Promise<void> {
  try {
    await redis.del(`${AI_CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error("Redis DEL error (ignoring):", error);
  }
}

/**
 * Invalidate all AI cache entries impacted by a baby's food/reaction updates.
 */
export async function invalidateBabyAiCaches(babyId: number): Promise<void> {
  await Promise.all([
    deleteAiCache(weeklyReportKey(babyId)),
    deleteAiCache(nutritionBalanceKey(babyId)),
    deleteAiCache(nextFoodsKey(babyId)),
    deleteAiCache(recipesKey(babyId)),
    deleteAiCache(tasteProfileKey(babyId)),
    deleteAiCache(similarFoodsKey(babyId)),
    // Backward compatibility keys
    deleteAiCache(weeklyPlanKey(babyId)),
    deleteAiCache(nutritionInsightKey(babyId)),
    deleteAiCache(nextFoodKey(babyId)),
    deleteAiCache(recipeLibraryKey(babyId)),
    deleteAiCache(mealPlanKey(babyId)),
    deleteAiCache(dailyPlanKey(babyId)),
  ]);
}

// ── Key builders (new: standardized cache key scheme) ──

/** weekly-report:{babyId}:{week} — 24h TTL */
export function weeklyReportKey(babyId: number): string {
  const weekNum = getISOWeekNumber();
  return `weekly-report:${babyId}:${weekNum}`;
}

/** nutrition-balance:{babyId} — 24h TTL */
export function nutritionBalanceKey(babyId: number): string {
  return `nutrition-balance:${babyId}`;
}

/** next-foods:{babyId} — 24h TTL */
export function nextFoodsKey(babyId: number): string {
  return `next-foods:${babyId}`;
}

/** recipes:{babyId} — 7 days TTL */
export function recipesKey(babyId: number): string {
  return `recipes:${babyId}`;
}

/** taste-profile:{babyId} — 24h TTL */
export function tasteProfileKey(babyId: number): string {
  return `taste-profile:${babyId}`;
}

/** Chat cache */
export function chatKey(babyId: number | string, questionHash: string): string {
  return `ai_chat:${babyId}:${questionHash}`;
}

/** Similar foods (internal, used by next-food) */
export function similarFoodsKey(babyId: number): string {
  return `similar-foods:${babyId}`;
}

/** Ingredient embeddings metadata */
export function ingredientEmbeddingsKey(): string {
  return `ingredient_embeddings:all`;
}

// ── Legacy key builders (kept for backward compat during migration) ──

/** @deprecated Use weeklyReportKey */
export function weeklyPlanKey(babyId: number): string {
  const weekNum = getISOWeekNumber();
  return `weekly_plan:${babyId}:${weekNum}`;
}

/** @deprecated Use nutritionBalanceKey */
export function nutritionInsightKey(babyId: number): string {
  const weekNum = getISOWeekNumber();
  return `nutrition_insight:${babyId}:${weekNum}`;
}

/** @deprecated Use nextFoodsKey */
export function nextFoodKey(babyId: number): string {
  return `next_food:${babyId}`;
}

/** @deprecated Use recipesKey */
export function recipeLibraryKey(babyId: number): string {
  return `recipe_library:${babyId}`;
}

/** @deprecated */
export function mealPlanKey(babyId: number): string {
  const weekNum = getISOWeekNumber();
  return `meal_plan:${babyId}:${weekNum}`;
}

/** @deprecated */
export function dailyPlanKey(babyId: number): string {
  const today = new Date().toISOString().split("T")[0];
  return `daily_plan:${babyId}:${today}`;
}

// ── TTL constants (seconds) ──

/** 7 days — for recipe suggestions */
export const RECIPE_TTL = 7 * 24 * 60 * 60;
/** 24 hours — default for most AI features */
export const DAILY_TTL = 24 * 60 * 60;
/** 12 hours */
export const CHAT_TTL = 12 * 60 * 60;

// Legacy aliases
/** @deprecated Use RECIPE_TTL */
export const WEEKLY_TTL = RECIPE_TTL;
/** @deprecated Use DAILY_TTL */
export const THREE_DAY_TTL = 3 * 24 * 60 * 60;

// ── Helpers ──

function getISOWeekNumber(): number {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Simple hash for chat question strings — deterministic, not cryptographic.
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return (hash >>> 0).toString(36);
}
