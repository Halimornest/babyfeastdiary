import { prisma } from "@/lib/prisma";
import { getBabyAgeInMonths } from "@/lib/babyAge";
import { getFoodStage } from "@/lib/ageStages";

/**
 * Aggregated weekly nutrition data — the ONLY input AI should receive.
 * Never send raw food logs to AI.
 */
export interface WeeklyNutritionSummary {
  ageMonths: number;
  foodStage: string;
  mealsThisWeek: number;
  newFoods: string[];
  categoryDistribution: {
    carbohydrates: number;
    animal_protein: number;
    plant_protein: number;
    vegetables: number;
    fruits: number;
  };
  mostLiked: string[];
  mostDisliked: string[];
  allergyFoods: string[];
  varietyScore: number;
  categoryCount: number;
}

/**
 * Aggregates all food log data from the past 7 days into a clean summary.
 * This is the single source of truth for weekly nutrition data.
 */
export async function aggregateWeeklyNutrition(
  babyId: number
): Promise<WeeklyNutritionSummary | null> {
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return null;

  const ageMonths = getBabyAgeInMonths(baby.birthDate);
  const stage = getFoodStage(ageMonths);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // This week's food logs
  const weekLogs = await prisma.foodLog.findMany({
    where: { babyId, date: { gte: oneWeekAgo } },
    include: {
      ingredients: { include: { ingredient: true } },
      reaction: true,
    },
    orderBy: { date: "desc" },
  });

  // All food logs before this week (for "new foods" detection)
  const previousNames = new Set<string>();
  const previousLogs = await prisma.foodLog.findMany({
    where: { babyId, date: { lt: oneWeekAgo } },
    include: { ingredients: { include: { ingredient: true } } },
  });
  for (const log of previousLogs) {
    for (const fi of log.ingredients) {
      previousNames.add(fi.ingredient.name);
    }
  }

  const weekCategories = new Set<string>();
  const newFoods: string[] = [];
  const likedMap: Record<string, number> = {};
  const dislikedSet = new Set<string>();
  const allergySet = new Set<string>();

  const catDist = {
    carbohydrates: 0,
    animal_protein: 0,
    plant_protein: 0,
    vegetables: 0,
    fruits: 0,
  };

  for (const log of weekLogs) {
    for (const fi of log.ingredients) {
      const name = fi.ingredient.name;
      weekCategories.add(fi.ingredient.category);

      if (!previousNames.has(name) && !newFoods.includes(name)) {
        newFoods.push(name);
      }

      switch (fi.ingredient.category) {
        case "KARBO": catDist.carbohydrates++; break;
        case "PROTEIN_HEWANI": catDist.animal_protein++; break;
        case "PROTEIN_NABATI": catDist.plant_protein++; break;
        case "SAYURAN": catDist.vegetables++; break;
        case "BUAH": catDist.fruits++; break;
      }

      if (log.reaction?.liked === true) {
        likedMap[name] = (likedMap[name] || 0) + 1;
      }
      if (log.reaction?.liked === false) dislikedSet.add(name);
      if (log.reaction?.allergy === true) allergySet.add(name);
    }
  }

  const mostLiked = Object.entries(likedMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  // Variety score: category coverage * 20 + new foods * 5, capped at 100
  const varietyScore = Math.min(weekCategories.size * 20 + newFoods.length * 5, 100);

  return {
    ageMonths,
    foodStage: stage.label,
    mealsThisWeek: weekLogs.length,
    newFoods,
    categoryDistribution: catDist,
    mostLiked,
    mostDisliked: [...dislikedSet].slice(0, 5),
    allergyFoods: [...allergySet],
    varietyScore,
    categoryCount: weekCategories.size,
  };
}
