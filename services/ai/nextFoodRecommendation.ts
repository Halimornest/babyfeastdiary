import { prisma } from "@/lib/prisma";
import { getBabyAgeInMonths, isReadyForSolids } from "@/lib/babyAge";
import { getFoodStage } from "@/lib/ageStages";
import { findSimilarToLiked } from "@/lib/ai/embeddings";
import { NEXT_FOOD_SIMILARITY_POOL, NEXT_FOOD_WEIGHTS } from "@/lib/ai/config";
import type { BabyFoodContext } from "@/lib/ai/rag";

export interface NextFoodRecommendation {
  name: string;
  category: string;
  categoryLabel: string;
  reason: string;
  score: number;
  ageAppropriate: boolean;
  scoreBreakdown?: {
    categoryGap: number;
    preference: number;
    similarity: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  KARBO: "Carbohydrates",
  PROTEIN_HEWANI: "Animal Protein",
  PROTEIN_NABATI: "Plant Protein",
  SAYURAN: "Vegetables",
  BUAH: "Fruits",
};

export async function getNextFoodRecommendations(
  context: BabyFoodContext,
  babyBirthDate: Date,
  topN: number = 5
): Promise<NextFoodRecommendation[]> {
  if (!isReadyForSolids(babyBirthDate)) return [];

  const ageMonths = getBabyAgeInMonths(babyBirthDate);
  const foodStage = getFoodStage(ageMonths);

  const allIngredients = await prisma.ingredient.findMany();
  const triedNames = new Set(context.triedFoods);
  const allergyNames = new Set(context.allergyFoods);

  const candidates = allIngredients.filter(
    (ing) => !triedNames.has(ing.name) && !allergyNames.has(ing.name)
  );

  if (candidates.length === 0) return [];

  const catCounts = context.foodCategories;
  const categoryPriority: Record<string, number> = {
    KARBO: catCounts.carbohydrate,
    PROTEIN_HEWANI: catCounts.proteinAnimal,
    PROTEIN_NABATI: catCounts.proteinPlant,
    SAYURAN: catCounts.vegetables,
    BUAH: catCounts.fruits,
  };
  const maxCatCount = Math.max(...Object.values(categoryPriority), 1);

  const likedCategories = new Map<string, number>();
  if (context.likedFoods.length > 0) {
    const likedIngredients = allIngredients.filter((ing) =>
      context.likedFoods.includes(ing.name)
    );
    for (const ing of likedIngredients) {
      likedCategories.set(ing.category, (likedCategories.get(ing.category) || 0) + 1);
    }
  }
  const maxLikedCount = Math.max(...likedCategories.values(), 1);

  const similarityMap = new Map<string, number>();
  try {
    const similarFoods = await findSimilarToLiked(context, NEXT_FOOD_SIMILARITY_POOL);
    for (const sf of similarFoods) {
      similarityMap.set(sf.name, sf.similarity / 100); 
    }
  } catch {

  }

  const scored = candidates.map((ing) => {

    const catCount = categoryPriority[ing.category] ?? 0;
    const categoryGap = 1 - catCount / maxCatCount;

    const preferenceScore = (likedCategories.get(ing.category) || 0) / maxLikedCount;

    const similarityScore = similarityMap.get(ing.name) || 0;

    const finalScore =
      NEXT_FOOD_WEIGHTS.categoryGap * categoryGap +
      NEXT_FOOD_WEIGHTS.preference * preferenceScore +
      NEXT_FOOD_WEIGHTS.similarity * similarityScore;

    const ageAppropriate = foodStage.preferredCategories.includes(ing.category);
    const reason = buildReason(ing.category, catCount, likedCategories.has(ing.category), similarityMap.has(ing.name), ageAppropriate, foodStage.label);

    return {
      name: ing.name,
      category: ing.category,
      categoryLabel: CATEGORY_LABELS[ing.category] || ing.category,
      reason,
      score: Math.round(finalScore * 100),
      ageAppropriate,
      scoreBreakdown: {
        categoryGap: Math.round(categoryGap * 100),
        preference: Math.round(preferenceScore * 100),
        similarity: Math.round(similarityScore * 100),
      },
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN);
}

function buildReason(
  category: string,
  catCount: number,
  isPreferred: boolean,
  hasSimilar: boolean,
  ageAppropriate: boolean,
  stageLabel: string
): string {
  if (catCount === 0) return `${CATEGORY_LABELS[category] || category} is missing from baby's diet`;
  if (isPreferred && hasSimilar) return `Similar to foods baby likes — great match`;
  if (isPreferred) return `Baby enjoys ${CATEGORY_LABELS[category] || category} foods`;
  if (hasSimilar) return `Similar to a food baby already likes`;
  if (catCount <= 2) return `${CATEGORY_LABELS[category] || category} needs more variety`;
  if (ageAppropriate) return `Great for ${stageLabel}`;
  return "New food to explore";
}
