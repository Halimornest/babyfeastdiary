import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { foodLogCreateSchema, formatZodIssueMessage } from "@/lib/api/schemas";
import { getAiCache, invalidateBabyAiCaches, nextFoodsKey } from "@/lib/ai-cache";
import { trackAiEvent } from "@/lib/observability/telemetry";

export async function POST(req: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = foodLogCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodIssueMessage(parsed.error) },
        { status: 400 }
      );
    }

    const {
      babyId,
      ingredientIds,
      seasoningIds,
      cookingMethodId,
      brothId,
      note,
    } = parsed.data;

    // Verify baby belongs to authenticated user
    const baby = await prisma.baby.findUnique({ where: { id: babyId } });
    if (!baby || baby.userId !== auth.userId) {
      return NextResponse.json({ error: "Baby not found" }, { status: 404 });
    }

    const previouslyTried = new Set(
      (
        await prisma.foodIngredient.findMany({
          where: { foodLog: { babyId } },
          select: { ingredientId: true },
          distinct: ["ingredientId"],
        })
      ).map((row) => row.ingredientId)
    );

    const foodLog = await prisma.foodLog.create({
      data: {
        babyId,
        cookingMethodId,
        brothId,
        note,

        ingredients: {
          create: ingredientIds.map((id: number) => ({
            ingredient: {
              connect: { id },
            },
          })),
        },

        seasonings: {
          create:
            seasoningIds?.map((id: number) => ({
              seasoning: {
                connect: { id },
              },
            })) ?? [],
        },
      },
    });

    const newFoodsCount = ingredientIds.filter((id) => !previouslyTried.has(id)).length;

    const ingredientRows = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } },
      select: { name: true },
    });
    const loggedIngredientNames = new Set(ingredientRows.map((row) => row.name));

    const cachedRecommendations = await getAiCache<{
      recommendations?: Array<{ name: string }>;
    }>(nextFoodsKey(babyId));
    const acceptedRecommendations =
      cachedRecommendations?.recommendations?.filter((rec) =>
        loggedIngredientNames.has(rec.name)
      ).length ?? 0;

    await invalidateBabyAiCaches(babyId);
    await trackAiEvent("food_log_created", {
      babyId,
      ingredientCount: ingredientIds.length,
      newFoodsCount,
      acceptedRecommendations,
    });

    if (acceptedRecommendations > 0) {
      await trackAiEvent("next_food_recommendation_accepted", {
        babyId,
        acceptedRecommendations,
      });
    }

    return NextResponse.json(foodLog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create food log" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const babyId = searchParams.get("babyId");

    // If babyId provided, verify it belongs to user
    if (babyId) {
      const baby = await prisma.baby.findUnique({ where: { id: Number(babyId) } });
      if (!baby || baby.userId !== auth.userId) {
        return NextResponse.json({ error: "Baby not found" }, { status: 404 });
      }
    }

    // Only return logs for babies belonging to this user
    const userBabyIds = (await prisma.baby.findMany({
      where: { userId: auth.userId },
      select: { id: true },
    })).map((b) => b.id);

    const foodLogs = await prisma.foodLog.findMany({
      where: babyId
        ? { babyId: Number(babyId), baby: { userId: auth.userId } }
        : { babyId: { in: userBabyIds } },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        seasonings: {
          include: {
            seasoning: true,
          },
        },
        cookingMethod: true,
        broth: true,
        reaction: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(foodLogs);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch food logs" },
      { status: 500 }
    );
  }
}