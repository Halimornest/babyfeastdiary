import { getCurrentUser } from "@/lib/auth";
import { getBabyFoodContext } from "@/lib/ai/rag";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAiCache, setAiCache, nextFoodsKey, DAILY_TTL } from "@/lib/ai-cache";
import { getNextFoodRecommendations } from "@/services/ai/nextFoodRecommendation";
import { babyIdQuerySchema, formatZodIssueMessage } from "@/lib/api/schemas";
import {
  AI_RATE_LIMIT_MAX_REQUESTS,
  AI_RATE_LIMIT_WINDOW_SECONDS,
  applyRateLimitHeaders,
  buildUserRateLimitKey,
  enforceRateLimit,
} from "@/lib/rate-limit";
import { trackAiEvent } from "@/lib/observability/telemetry";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(
      buildUserRateLimitKey(auth.userId, "ai-next-foods"),
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
    const cacheKey = nextFoodsKey(babyId);
    const cached = await getAiCache(cacheKey);
    if (cached) {
      await trackAiEvent("next_foods_cache_hit", { userId: auth.userId, babyId });
      const response = NextResponse.json(cached);
      return applyRateLimitHeaders(response, rateLimit);
    }

    const context = await getBabyFoodContext(babyId);
    const recommendations = context
      ? await getNextFoodRecommendations(context, baby.birthDate, 5)
      : [];

    const response = {
      recommendations,
      reason: recommendations.length > 0
        ? "These foods complement nutrients missing from the baby's recent meals."
        : "Start logging meals to receive personalized food recommendations.",
      disclaimer: "This is not medical advice. Always consult your pediatrician for dietary guidance.",
    };

    await setAiCache(cacheKey, response, DAILY_TTL);
    await trackAiEvent("next_foods_generated", {
      userId: auth.userId,
      babyId,
      recommendationCount: recommendations.length,
    });

    const json = NextResponse.json(response);
    return applyRateLimitHeaders(json, rateLimit);
  } catch (error) {
    console.error("Next foods error:", error);
    return NextResponse.json(
      { error: "Failed to generate food recommendations" },
      { status: 500 }
    );
  }
}
