import { prisma } from "@/lib/prisma";
import { getBabyFoodContext } from "@/lib/ai/rag";
import { getNextFoodRecommendations } from "@/services/ai/nextFoodRecommendation";
import { setAiCache, nextFoodsKey, DAILY_TTL } from "@/lib/ai-cache";

/**
 * Background job: pre-generate next food recommendations for all babies.
 * Uses the new pure-algorithm service (no OpenAI).
 */
export async function runNextFoodGeneration(): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  const babies = await prisma.baby.findMany({
    select: { id: true, birthDate: true },
  });
  let success = 0;
  let failed = 0;

  for (const baby of babies) {
    try {
      const context = await getBabyFoodContext(baby.id);
      if (!context) {
        failed++;
        continue;
      }

      const recommendations = await getNextFoodRecommendations(
        context,
        baby.birthDate,
        10
      );

      const response = {
        recommendations,
        reason:
          recommendations.length > 0
            ? "These foods complement nutrients missing from the baby's recent meals."
            : "Start logging meals to receive personalized food recommendations.",
        disclaimer:
          "This is not medical advice. Always consult your pediatrician for dietary guidance.",
      };

      await setAiCache(nextFoodsKey(baby.id), response, DAILY_TTL);
      success++;
    } catch (error) {
      console.error(`[NextFoodJob] Failed for baby ${baby.id}:`, error);
      failed++;
    }
  }

  console.log(
    `[NextFoodJob] Done — ${success} ok, ${failed} failed out of ${babies.length}`
  );
  return { total: babies.length, success, failed };
}
