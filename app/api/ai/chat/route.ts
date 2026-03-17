import { getCurrentUser } from "@/lib/auth";
import { getBabyFoodContext } from "@/lib/ai/rag";
import { generateContextualResponse } from "@/lib/ai/chat-response";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAiCache, setAiCache, chatKey, simpleHash, CHAT_TTL } from "@/lib/ai-cache";
import { aiChatRequestSchema, formatZodIssueMessage } from "@/lib/api/schemas";
import {
  AI_RATE_LIMIT_MAX_REQUESTS,
  AI_RATE_LIMIT_WINDOW_SECONDS,
  applyRateLimitHeaders,
  buildUserRateLimitKey,
  enforceRateLimit,
} from "@/lib/rate-limit";
import { trackAiEvent } from "@/lib/observability/telemetry";

const CHAT_CACHE_VERSION = "v2";

export async function POST(req: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(
      buildUserRateLimitKey(auth.userId, "ai-chat"),
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

    const body = await req.json();
    const parsed = aiChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodIssueMessage(parsed.error) },
        { status: 400 }
      );
    }
    const { message, babyId } = parsed.data;

    // Check Redis cache for identical questions
    const questionHash = simpleHash(message.trim().toLowerCase());
    const cacheKey = chatKey(`${babyId || "none"}:${CHAT_CACHE_VERSION}`, questionHash);
    const cached = await getAiCache<{ reply: string }>(cacheKey);
    if (cached) {
      await trackAiEvent("ai_chat_cache_hit", { userId: auth.userId, hasBabyId: Boolean(babyId) });
      const response = NextResponse.json(cached);
      return applyRateLimitHeaders(response, rateLimit);
    }

    // Retrieve RAG context
    let context = null;
    let babyBirthDate: Date | null = null;
    if (babyId) {
      context = await getBabyFoodContext(babyId);
      const baby = await prisma.baby.findUnique({ where: { id: babyId }, select: { birthDate: true } });
      babyBirthDate = baby?.birthDate ?? null;
    }

    const reply = await generateContextualResponse(message, context, babyId, babyBirthDate);

    const response = { reply };
    await setAiCache(cacheKey, response, CHAT_TTL);
    await trackAiEvent("ai_chat_generated", {
      userId: auth.userId,
      hasBabyId: Boolean(babyId),
      promptLength: message.length,
    });

    const json = NextResponse.json(response);
    return applyRateLimitHeaders(json, rateLimit);
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
