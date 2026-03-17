import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ babyId: string }> }
) {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { babyId } = await context.params;
  const id = Number(babyId);

  // Verify baby belongs to authenticated user
  const baby = await prisma.baby.findUnique({ where: { id } });
  if (!baby || baby.userId !== auth.userId) {
    return NextResponse.json({ error: "Baby not found" }, { status: 404 });
  }

  const foodLogs = await prisma.foodLog.findMany({
    where: {
      babyId: id,
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
      reaction: true,
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

  return NextResponse.json({
    favoriteFoods,
    allergyFoods: Array.from(allergyIngredients),
    triedFoods: Array.from(triedIngredients),
  });
}