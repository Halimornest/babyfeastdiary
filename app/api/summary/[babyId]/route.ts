import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { buildRequestLog, jsonError } from "@/lib/observability/http";

export async function GET(
  req: Request,
  context: { params: Promise<{ babyId: string }> }
) {
  const reqLog = buildRequestLog(req, { route: "/api/summary/[babyId]" });
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      reqLog.fail("unauthorized", 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { babyId } = await context.params;
    const id = Number(babyId);

    // Verify baby belongs to authenticated user
    const baby = await prisma.baby.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!baby || baby.userId !== auth.userId) {
      reqLog.fail("baby_not_found", 404, { userId: auth.userId, babyId: id });
      return NextResponse.json({ error: "Baby not found" }, { status: 404 });
    }

    const foodLogs = await prisma.foodLog.findMany({
      where: {
        babyId: id,
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: 500,
      select: {
        ingredients: {
          select: {
            ingredient: {
              select: {
                name: true,
              },
            },
          },
        },
        reaction: {
          select: {
            liked: true,
            allergy: true,
          },
        },
      },
    });

    const likedIngredients: Record<string, number> = {};
    const allergyIngredients: Set<string> = new Set();
    const triedIngredients: Set<string> = new Set();

    foodLogs.forEach((log) => {
      log.ingredients.forEach((item) => {
        const name = item.ingredient.name;

        triedIngredients.add(name);

        if (log.reaction?.liked) {
          likedIngredients[name] = (likedIngredients[name] || 0) + 1;
        }

        if (log.reaction?.allergy) {
          allergyIngredients.add(name);
        }
      });
    });

    const favoriteFoods = Object.entries(likedIngredients)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    reqLog.ok(200, {
      userId: auth.userId,
      babyId: id,
      favoriteCount: favoriteFoods.length,
      triedCount: triedIngredients.size,
    });
    return NextResponse.json(
      {
        favoriteFoods,
        allergyFoods: Array.from(allergyIngredients),
        triedFoods: Array.from(triedIngredients),
      },
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } }
    );
  } catch (error) {
    reqLog.fail(error, 500);
    return jsonError(error, "Failed to fetch summary");
  }
}
