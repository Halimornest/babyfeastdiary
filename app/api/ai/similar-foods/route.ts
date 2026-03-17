import { getCurrentUser } from "@/lib/auth";
import { getBabyFoodContext } from "@/lib/ai/rag";
import { findSimilarToLiked } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  getAiCache,
  setAiCache,
  similarFoodsKey,
  THREE_DAY_TTL,
} from "@/lib/ai-cache";
import { babyIdQuerySchema, formatZodIssueMessage } from "@/lib/api/schemas";
import {
  AI_RATE_LIMIT_MAX_REQUESTS,
  AI_RATE_LIMIT_WINDOW_SECONDS,
  applyRateLimitHeaders,
  buildUserRateLimitKey,
  enforceRateLimit,
} from "@/lib/rate-limit";
import { trackAiEvent } from "@/lib/observability/telemetry";

/**
 * GET /api/ai/similar-foods?babyId=X
 *
 * Returns foods similar to the ones baby likes, using vector embeddings.
 * Redis-first: reads from cache, falls back to on-demand computation.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(
      buildUserRateLimitKey(auth.userId, "ai-similar-foods"),
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

    // Read from Redis first
    const cacheKey = similarFoodsKey(babyId);
    const cached = await getAiCache(cacheKey);
    if (cached) {
      await trackAiEvent("similar_foods_cache_hit", { userId: auth.userId, babyId });
      const response = NextResponse.json(cached);
      return applyRateLimitHeaders(response, rateLimit);
    }

    // Fallback: compute on demand
    const embeddingCount = await prisma.ingredientEmbedding.count();
    if (embeddingCount === 0) {
      const response = NextResponse.json({
        similarFoods: [],
        totalEmbeddings: 0,
        basedOnLikedCount: 0,
        disclaimer:
          "Embedding belum tersedia. Silakan tunggu proses background selesai.",
      });
      return applyRateLimitHeaders(response, rateLimit);
    }

    const context = await getBabyFoodContext(babyId);
    const similarFoods = context ? await findSimilarToLiked(context, 8) : [];

    const response = {
      similarFoods,
      totalEmbeddings: embeddingCount,
      basedOnLikedCount: context?.likedFoods.length ?? 0,
      disclaimer:
        "Rekomendasi ini berdasarkan kemiripan semantik bahan makanan. Bukan saran medis — selalu konsultasikan dengan dokter anak.",
    };

    await setAiCache(cacheKey, response, THREE_DAY_TTL);
    await trackAiEvent("similar_foods_generated", {
      userId: auth.userId,
      babyId,
      similarCount: similarFoods.length,
      basedOnLikedCount: context?.likedFoods.length ?? 0,
    });

    const json = NextResponse.json(response);
    return applyRateLimitHeaders(json, rateLimit);
  } catch (error) {
    console.error("Similar foods error:", error);
    return NextResponse.json(
      { error: "Failed to get similar food recommendations" },
      { status: 500 }
    );
  }
}
