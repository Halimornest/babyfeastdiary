import { prisma } from "@/lib/prisma";
import { getBabyAgeInMonths } from "@/lib/babyAge";
import { getFoodStage } from "@/lib/ageStages";

export interface BabyFoodContext {
  babyName: string;
  babyAgeMonths: number | null;
  foodStageLabel: string | null;
  foodStageTexture: string | null;
  likedFoods: string[];
  dislikedFoods: string[];
  allergyFoods: string[];
  triedFoods: string[];
  foodCategories: {
    carbohydrate: number;
    proteinAnimal: number;
    proteinPlant: number;
    vegetables: number;
    fruits: number;
  };
  recentMeals: {
    date: Date;
    ingredients: string[];
    liked: boolean | null;
    allergy: boolean | null;
  }[];
  allowedSeasonings: string[];
  restrictedSeasonings: string[];
}

export async function getBabyFoodContext(
  babyId: number
): Promise<BabyFoodContext | null> {
  const baby = await prisma.baby.findUnique({
    where: { id: babyId },
    select: { name: true, birthDate: true },
  });

  if (!baby) return null;

  const ageMonths = getBabyAgeInMonths(baby.birthDate);
  const stage = getFoodStage(ageMonths);

  const foodLogs = await prisma.foodLog.findMany({
    where: { babyId },
    include: {
      ingredients: { include: { ingredient: true } },
      reaction: true,
    },
    orderBy: { date: "desc" },
  });

  const likedSet = new Set<string>();
  const dislikedSet = new Set<string>();
  const allergySet = new Set<string>();
  const triedSet = new Set<string>();
  const countedIngredients = new Set<string>();
  const categoryCount = {
    carbohydrate: 0,
    proteinAnimal: 0,
    proteinPlant: 0,
    vegetables: 0,
    fruits: 0,
  };

  for (const log of foodLogs) {
    for (const fi of log.ingredients) {
      const name = fi.ingredient.name;
      const category = fi.ingredient.category;

      triedSet.add(name);

      // Count unique ingredients per category
      if (!countedIngredients.has(name)) {
        countedIngredients.add(name);
        switch (category) {
          case "KARBO":
            categoryCount.carbohydrate++;
            break;
          case "PROTEIN_HEWANI":
            categoryCount.proteinAnimal++;
            break;
          case "PROTEIN_NABATI":
            categoryCount.proteinPlant++;
            break;
          case "SAYURAN":
            categoryCount.vegetables++;
            break;
          case "BUAH":
            categoryCount.fruits++;
            break;
        }
      }

      if (log.reaction?.liked === true) likedSet.add(name);
      if (log.reaction?.liked === false) dislikedSet.add(name);
      if (log.reaction?.allergy === true) allergySet.add(name);
    }
  }

  const triedFoods = [...triedSet];

  const recentMeals = foodLogs.slice(0, 20).map((log) => ({
    date: log.date,
    ingredients: log.ingredients.map((fi) => fi.ingredient.name),
    liked: log.reaction?.liked ?? null,
    allergy: log.reaction?.allergy ?? null,
  }));

  const allSeasonings = await prisma.seasoning.findMany({
    select: { name: true, minAgeMonths: true },
    orderBy: [{ minAgeMonths: "asc" }, { name: "asc" }],
  });

  const allowedSeasonings = allSeasonings
    .filter((item) => ageMonths >= item.minAgeMonths)
    .map((item) => item.name);

  const restrictedSeasonings = allSeasonings
    .filter((item) => ageMonths < item.minAgeMonths)
    .map((item) => item.name);

  return {
    babyName: baby.name,
    babyAgeMonths: ageMonths,
    foodStageLabel: stage.label,
    foodStageTexture: stage.texture,
    likedFoods: [...likedSet],
    dislikedFoods: [...dislikedSet],
    allergyFoods: [...allergySet],
    triedFoods: triedFoods,
    foodCategories: categoryCount,
    recentMeals,
    allowedSeasonings,
    restrictedSeasonings,
  };
}
