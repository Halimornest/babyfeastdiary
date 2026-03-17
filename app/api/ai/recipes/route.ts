import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAiCache, setAiCache, recipesKey, RECIPE_TTL } from "@/lib/ai-cache";
import { aggregateWeeklyNutrition } from "@/services/data/weeklyNutritionAggregator";
import { generateRecipeSuggestions } from "@/services/ai/generateRecipes";
import { babyIdQuerySchema, formatZodIssueMessage } from "@/lib/api/schemas";
import {
  AI_RATE_LIMIT_MAX_REQUESTS,
  AI_RATE_LIMIT_WINDOW_SECONDS,
  applyRateLimitHeaders,
  buildUserRateLimitKey,
  enforceRateLimit,
} from "@/lib/rate-limit";
import { trackAiEvent } from "@/lib/observability/telemetry";
import { withInsightMeta } from "@/lib/api/insightMeta";

const EMPTY_RECIPE_TTL = 10 * 60;

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(
      buildUserRateLimitKey(auth.userId, "ai-recipes"),
      AI_RATE_LIMIT_MAX_REQUESTS,
      AI_RATE_LIMIT_WINDOW_SECONDS
    );
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      return applyRateLimitHeaders(response, rateLimit);
    }

    const parsedQuery = babyIdQuerySchema.safeParse({
      babyId: req.nextUrl.searchParams.get("babyId"),
    });
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: formatZodIssueMessage(parsedQuery.error) },
        { status: 400 }
      );
    }
    const { babyId } = parsedQuery.data;

    const baby = await prisma.baby.findUnique({ where: { id: babyId } });
    if (!baby || baby.userId !== auth.userId) {
      return NextResponse.json({ error: "Baby not found" }, { status: 404 });
    }

    const count = Math.min(Number(req.nextUrl.searchParams.get("count")) || 3, 5);

    // Check Redis cache
    const cacheKey = recipesKey(babyId);
    const cached = await getAiCache(cacheKey);
    if (cached && Array.isArray((cached as { recipes?: unknown }).recipes) && (cached as { recipes: unknown[] }).recipes.length > 0) {
      await trackAiEvent("recipes_cache_hit", { userId: auth.userId, babyId });
      const response = NextResponse.json(
        withInsightMeta(cached as Record<string, unknown>, {
          dataSource: "cache",
          cacheKey,
          cacheTtlSeconds: RECIPE_TTL,
        })
      );
      return applyRateLimitHeaders(response, rateLimit);
    }

    if (cached) {
      await trackAiEvent("recipes_cache_empty_ignored", { userId: auth.userId, babyId });
    }

    // Step 1: Aggregate data
    const summary = await aggregateWeeklyNutrition(babyId);

    let recipes: NonNullable<Awaited<ReturnType<typeof generateRecipeSuggestions>>>["recipes"] = [];

    if (summary) {
      // Step 2: Generate recipes from AI using aggregated data
      const result = await generateRecipeSuggestions(summary, count);
      recipes = result?.recipes ?? [];
    }

    const response = {
      recipes,
      disclaimer: "These are general recipe suggestions. Always ensure foods are age-appropriate and consult your pediatrician.",
    };

    const responseWithMeta = withInsightMeta(response, {
      dataSource: "fresh",
      cacheKey,
      cacheTtlSeconds: RECIPE_TTL,
    });

    await setAiCache(
      cacheKey,
      responseWithMeta,
      recipes.length > 0 ? RECIPE_TTL : EMPTY_RECIPE_TTL
    );
    await trackAiEvent("recipes_generated", { userId: auth.userId, babyId, recipeCount: recipes.length, requestedCount: count });

    const json = NextResponse.json(responseWithMeta);
    return applyRateLimitHeaders(json, rateLimit);
  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipes" },
      { status: 500 }
    );
  }
}
