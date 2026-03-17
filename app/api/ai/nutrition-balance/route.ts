import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAiCache, setAiCache, nutritionBalanceKey, DAILY_TTL } from "@/lib/ai-cache";
import { analyzeNutritionBalanceService } from "@/services/ai/nutritionBalance";
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
      buildUserRateLimitKey(auth.userId, "ai-nutrition-balance"),
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
    const cacheKey = nutritionBalanceKey(babyId);
    const cached = await getAiCache(cacheKey);
    if (cached) {
      await trackAiEvent("nutrition_balance_cache_hit", { userId: auth.userId, babyId });
      const response = NextResponse.json(
        withInsightMeta(cached as Record<string, unknown>, {
          dataSource: "cache",
          cacheKey,
          cacheTtlSeconds: DAILY_TTL,
        })
      );
      return applyRateLimitHeaders(response, rateLimit);
    }

    const result = await analyzeNutritionBalanceService(babyId);

    const response = {
      ...(result ?? {
        categories: [],
        overallBalance: "poor" as const,
        aiInsight: null,
        ageStage: "",
      }),
      disclaimer: "This is not medical advice. Always consult your pediatrician for dietary guidance.",
    };

    const responseWithMeta = withInsightMeta(response, {
      dataSource: "fresh",
      cacheKey,
      cacheTtlSeconds: DAILY_TTL,
    });

    await setAiCache(cacheKey, responseWithMeta, DAILY_TTL);
    await trackAiEvent("nutrition_balance_generated", { userId: auth.userId, babyId });

    const json = NextResponse.json(responseWithMeta);
    return applyRateLimitHeaders(json, rateLimit);
  } catch (error) {
    console.error("Nutrition balance error:", error);
    return NextResponse.json(
      { error: "Failed to analyze nutrition balance" },
      { status: 500 }
    );
  }
}
