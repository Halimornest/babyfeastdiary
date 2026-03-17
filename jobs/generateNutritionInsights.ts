import { prisma } from "@/lib/prisma";
import { analyzeNutritionBalanceService } from "@/services/ai/nutritionBalance";
import { setAiCache, nutritionBalanceKey, DAILY_TTL } from "@/lib/ai-cache";

/**
 * Background job: pre-generate nutrition balance insights for all babies.
 * Uses the new structured AI service.
 */
export async function runNutritionInsightGeneration(): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  const babies = await prisma.baby.findMany({ select: { id: true } });
  let success = 0;
  let failed = 0;

  for (const baby of babies) {
    try {
      const result = await analyzeNutritionBalanceService(baby.id);

      if (!result) {
        failed++;
        continue;
      }

      const response = {
        ...result,
        disclaimer:
          "This is not medical advice. Always consult your pediatrician for dietary guidance.",
      };

      await setAiCache(nutritionBalanceKey(baby.id), response, DAILY_TTL);
      success++;
    } catch (error) {
      console.error(`[NutritionJob] Failed for baby ${baby.id}:`, error);
      failed++;
    }
  }

  console.log(
    `[NutritionJob] Done — ${success} ok, ${failed} failed out of ${babies.length}`
  );
  return { total: babies.length, success, failed };
}
