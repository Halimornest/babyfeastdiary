import { prisma } from "@/lib/prisma";

/**
 * Aggregated taste profile data — computed from food log reactions.
 * Used by the Taste Profile UI section. No AI call needed.
 */
export interface TasteProfileSummary {
  categoryAffinities: {
    category: string;
    label: string;
    emoji: string;
    score: number;        // -1.0 to 1.0
    totalExposures: number;
    likedCount: number;
    dislikedCount: number;
  }[];
  overallOpenness: number; // 0-100
  preferredTextures: string[];
  strongLikes: string[];
  strongDislikes: string[];
}

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  KARBO: { label: "Carbohydrates", emoji: "🍚" },
  PROTEIN_HEWANI: { label: "Animal Protein", emoji: "🥩" },
  PROTEIN_NABATI: { label: "Plant Protein", emoji: "🫘" },
  SAYURAN: { label: "Vegetables", emoji: "🥬" },
  BUAH: { label: "Fruits", emoji: "🍎" },
};

/**
 * Aggregates taste profile from food log history.
 * Pure data computation — no AI involved.
 */
export async function aggregateTasteProfile(
  babyId: number
): Promise<TasteProfileSummary | null> {
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return null;

  const foodLogs = await prisma.foodLog.findMany({
    where: { babyId },
    include: {
      ingredients: { include: { ingredient: true } },
      reaction: true,
      cookingMethod: true,
    },
    orderBy: { date: "desc" },
  });

  const categoryStats: Record<string, {
    liked: number; disliked: number; neutral: number; total: number;
  }> = {};

  for (const cat of Object.keys(CATEGORY_META)) {
    categoryStats[cat] = { liked: 0, disliked: 0, neutral: 0, total: 0 };
  }

  const likedFoods = new Set<string>();
  const dislikedFoods = new Set<string>();
  const textureCounts: Record<string, number> = {};
  let totalWithReaction = 0;
  let totalLiked = 0;

  for (const log of foodLogs) {
    if (log.cookingMethod) {
      textureCounts[log.cookingMethod.name] = (textureCounts[log.cookingMethod.name] || 0) + 1;
    }

    for (const fi of log.ingredients) {
      const cat = fi.ingredient.category;
      if (!categoryStats[cat]) {
        categoryStats[cat] = { liked: 0, disliked: 0, neutral: 0, total: 0 };
      }
      categoryStats[cat].total++;

      if (log.reaction) {
        totalWithReaction++;
        if (log.reaction.liked === true) {
          categoryStats[cat].liked++;
          likedFoods.add(fi.ingredient.name);
          totalLiked++;
        } else if (log.reaction.liked === false) {
          categoryStats[cat].disliked++;
          dislikedFoods.add(fi.ingredient.name);
        } else {
          categoryStats[cat].neutral++;
        }
      } else {
        categoryStats[cat].neutral++;
      }
    }
  }

  const categoryAffinities = Object.entries(categoryStats).map(([cat, stats]) => {
    const meta = CATEGORY_META[cat] || { label: cat, emoji: "🍽️" };
    let score = 0;
    if (stats.total > 0) {
      const positive = stats.liked + stats.neutral * 0.1;
      const negative = stats.disliked;
      score = Math.max(-1, Math.min(1, (positive - negative) / stats.total));
    }
    return {
      category: cat,
      label: meta.label,
      emoji: meta.emoji,
      score: Math.round(score * 100) / 100,
      totalExposures: stats.total,
      likedCount: stats.liked,
      dislikedCount: stats.disliked,
    };
  });

  const categoryVariety = categoryAffinities.filter((c) => c.totalExposures > 0).length;
  const likeRatio = totalWithReaction > 0 ? totalLiked / totalWithReaction : 0.5;
  const varietyBonus = (categoryVariety / 5) * 20;
  const overallOpenness = Math.min(100, Math.round(likeRatio * 80 + varietyBonus));

  const preferredTextures = Object.entries(textureCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return {
    categoryAffinities,
    overallOpenness,
    preferredTextures,
    strongLikes: [...likedFoods].slice(0, 10),
    strongDislikes: [...dislikedFoods].slice(0, 10),
  };
}
