import { prisma } from "@/lib/prisma";
import { aggregateWeeklyNutrition } from "@/services/data/weeklyNutritionAggregator";
import { generateWeeklyInsight } from "@/services/ai/generateWeeklyInsight";
import { setAiCache, weeklyReportKey, DAILY_TTL } from "@/lib/ai-cache";

/**
 * Background job: pre-generate weekly AI reports for all babies.
 * Uses the new data aggregation → structured AI pipeline.
 */
export async function runWeeklyGeneration(): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  const babies = await prisma.baby.findMany({ select: { id: true } });
  let success = 0;
  let failed = 0;

  for (const baby of babies) {
    try {
      const summary = await aggregateWeeklyNutrition(baby.id);
      if (!summary) {
        failed++;
        continue;
      }

      const aiInsight = await generateWeeklyInsight(summary).catch(() => null);

      const response = {
        mealsThisWeek: summary.mealsThisWeek,
        newFoods: summary.newFoods.length,
        newFoodNames: summary.newFoods,
        favoriteFoods: summary.mostLiked,
        dislikedFoods: summary.mostDisliked,
        allergyFoods: summary.allergyFoods,
        categoryDistribution: summary.categoryDistribution,
        varietyScore: {
          score: summary.varietyScore,
          level: summary.varietyScore >= 70 ? "excellent" : summary.varietyScore >= 40 ? "moderate" : "low",
          explanation: `Variety score: ${summary.varietyScore}/100 based on ${summary.categoryCount} categories and ${summary.newFoods.length} new foods.`,
          categoryCount: summary.categoryCount,
          newFoodsThisWeek: summary.newFoods.length,
        },
        aiInsight,
        disclaimer: "This is not medical advice. Always consult your pediatrician for dietary guidance.",
      };

      await setAiCache(weeklyReportKey(baby.id), response, DAILY_TTL);
      success++;
    } catch (error) {
      console.error(`[WeeklyJob] Failed for baby ${baby.id}:`, error);
      failed++;
    }
  }

  console.log(`[WeeklyJob] Done — ${success} ok, ${failed} failed out of ${babies.length}`);
  return { total: babies.length, success, failed };
}
