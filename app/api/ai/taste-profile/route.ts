import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAiCache, setAiCache, tasteProfileKey, DAILY_TTL } from "@/lib/ai-cache";
import { aggregateTasteProfile } from "@/services/data/tasteProfileAggregator";
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
      buildUserRateLimitKey(auth.userId, "ai-taste-profile"),
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
    const cacheKey = tasteProfileKey(babyId);
    const cached = await getAiCache(cacheKey);
    if (cached) {
      await trackAiEvent("taste_profile_cache_hit", { userId: auth.userId, babyId });
      const response = NextResponse.json(cached);
      return applyRateLimitHeaders(response, rateLimit);
    }

    const profile = await aggregateTasteProfile(babyId);

    const response = {
      profile: profile ?? null,
      disclaimer: "Taste profile is built from eating history and reactions. Log more meals for better accuracy.",
    };

    await setAiCache(cacheKey, response, DAILY_TTL);
    await trackAiEvent("taste_profile_generated", { userId: auth.userId, babyId, hasProfile: Boolean(profile) });

    const json = NextResponse.json(response);
    return applyRateLimitHeaders(json, rateLimit);
  } catch (error) {
    console.error("Taste profile error:", error);
    return NextResponse.json(
      { error: "Failed to build taste profile" },
      { status: 500 }
    );
  }
}
