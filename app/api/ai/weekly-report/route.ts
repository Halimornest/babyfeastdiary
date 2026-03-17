import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAiCache, setAiCache, weeklyReportKey, DAILY_TTL } from "@/lib/ai-cache";
import { aggregateWeeklyNutrition } from "@/services/data/weeklyNutritionAggregator";
import { generateWeeklyInsight } from "@/services/ai/generateWeeklyInsight";
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

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(
      buildUserRateLimitKey(auth.userId, "ai-weekly-report"),
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

    // Check Redis cache
    const cacheKey = weeklyReportKey(babyId);
    const cached = await getAiCache(cacheKey);
    if (cached) {
      await trackAiEvent("weekly_report_cache_hit", { userId: auth.userId, babyId });
      const response = NextResponse.json(
        withInsightMeta(cached as Record<string, unknown>, {
          dataSource: "cache",
          cacheKey,
          cacheTtlSeconds: DAILY_TTL,
        })
      );
      return applyRateLimitHeaders(response, rateLimit);
    }

    // Step 1: Aggregate data (never send raw logs to AI)
    const summary = await aggregateWeeklyNutrition(babyId);

    if (!summary) {
      const emptyResponse = {
        mealsThisWeek: 0,
        newFoods: 0,
        newFoodNames: [],
        favoriteFoods: [],
        dislikedFoods: [],
        allergyFoods: [],
        categoryDistribution: { carbohydrates: 0, animal_protein: 0, plant_protein: 0, vegetables: 0, fruits: 0 },
        varietyScore: { score: 0, level: "low" as const, explanation: "Start logging meals to see your weekly report.", categoryCount: 0, newFoodsThisWeek: 0 },
        aiInsight: null,
        disclaimer: "This is not medical advice. Always consult your pediatrician for dietary guidance.",
      };
      const response = NextResponse.json(
        withInsightMeta(emptyResponse, {
          dataSource: "fresh",
          cacheKey,
          cacheTtlSeconds: DAILY_TTL,
        })
      );
      return applyRateLimitHeaders(response, rateLimit);
    }

    // Step 2: Generate structured AI insight from aggregated data
    const aiInsight = await generateWeeklyInsight(summary).catch(() => null);

    const response = {
      mealsThisWeek: summary.mealsThisWeek,
      newFoods: summary.newFoods.length,
      newFoodNames: summary.newFoods,
      favoriteFoods: summary.mostLiked,
      dislikedFoods: summary.mostDisliked,
      allergyFoods: summary.allergyFoods,
      categoryDistribution: summary.categoryDistribution,
      varietyScore: {
        score: summary.varietyScore,
        level: summary.varietyScore >= 70 ? "excellent" : summary.varietyScore >= 40 ? "moderate" : "low",
        explanation: buildVarietyExplanation(summary.categoryCount, summary.newFoods.length, summary.varietyScore),
        categoryCount: summary.categoryCount,
        newFoodsThisWeek: summary.newFoods.length,
      },
      aiInsight,
      disclaimer: "This is not medical advice. Always consult your pediatrician for dietary guidance.",
    };

    const responseWithMeta = withInsightMeta(response, {
      dataSource: "fresh",
      cacheKey,
      cacheTtlSeconds: DAILY_TTL,
    });

    await setAiCache(cacheKey, responseWithMeta, DAILY_TTL);
    await trackAiEvent("weekly_report_generated", {
      userId: auth.userId,
      babyId,
      mealsThisWeek: summary.mealsThisWeek,
      newFoods: summary.newFoods.length,
    });

    const json = NextResponse.json(responseWithMeta);
    return applyRateLimitHeaders(json, rateLimit);
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly report" },
      { status: 500 }
    );
  }
}

function buildVarietyExplanation(categoryCount: number, newFoods: number, score: number): string {
  if (score >= 70) return `Your baby has tried foods from ${categoryCount} categories with ${newFoods} new foods this week. Excellent food diversity! 🌟`;
  if (score >= 40) return `Your baby has tried foods from ${categoryCount} categories with ${newFoods} new foods this week. Good diversity — keep exploring! 💪`;
  return `Your baby has tried foods from ${categoryCount} categories with ${newFoods} new foods this week. Consider introducing more variety. 🥦`;
}
