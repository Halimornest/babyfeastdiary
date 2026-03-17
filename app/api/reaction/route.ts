import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { formatZodIssueMessage, reactionCreateSchema } from "@/lib/api/schemas";
import { invalidateBabyAiCaches } from "@/lib/ai-cache";
import { trackAiEvent } from "@/lib/observability/telemetry";

export async function POST(req: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reactionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodIssueMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { foodLogId, liked, allergy, note, reactionIntensity } = parsed.data;

    // Verify the food log belongs to user's baby
    const foodLog = await prisma.foodLog.findUnique({
      where: { id: foodLogId },
      include: { baby: { select: { id: true, userId: true } } },
    });
    if (!foodLog || foodLog.baby.userId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const reaction = await prisma.reaction.upsert({
      where: {
        foodLogId: foodLogId,
      },
      update: {
        liked,
        allergy,
        note,
        reactionIntensity,
      },
      create: {
        foodLogId,
        liked,
        allergy,
        note,
        reactionIntensity,
      },
    });

    await invalidateBabyAiCaches(foodLog.baby.id);
    await trackAiEvent("reaction_saved", {
      babyId: foodLog.baby.id,
      foodLogId,
      liked: liked ?? null,
      allergy: allergy ?? null,
      reactionIntensity: reactionIntensity ?? null,
    });

    return NextResponse.json(reaction);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save reaction" },
      { status: 500 }
    );
  }
}