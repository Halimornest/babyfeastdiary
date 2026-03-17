import { prisma } from "@/lib/prisma";
import { aggregateWeeklyNutrition } from "@/services/data/weeklyNutritionAggregator";
import { generateRecipeSuggestions } from "@/services/ai/generateRecipes";
import { setAiCache, recipesKey, RECIPE_TTL } from "@/lib/ai-cache";

const LIBRARY_SIZE = 5;

/**
 * Background job: pre-generate personalized recipe libraries for all babies.
 * Uses the new AI recipe service with structured JSON output.
 */
export async function runRecipeLibraryGeneration(): Promise<{
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

      const result = await generateRecipeSuggestions(summary, LIBRARY_SIZE);

      const response = {
        recipes: (result?.recipes || []).map((r) => ({
          name: r.name,
          ageRange: r.ageRange,
          texture: r.texture,
          prepTime: r.prepTime,
          ingredients: r.ingredients,
          steps: r.steps,
          nutritionHighlights: r.nutritionHighlights,
          tips: r.tips,
        })),
        disclaimer:
          "These are general recipe suggestions. Always ensure foods are age-appropriate and consult your pediatrician.",
      };

      await setAiCache(recipesKey(baby.id), response, RECIPE_TTL);
      success++;
    } catch (error) {
      console.error(`[RecipeLibraryJob] Failed for baby ${baby.id}:`, error);
      failed++;
    }
  }

  console.log(
    `[RecipeLibraryJob] Done — ${success} ok, ${failed} failed out of ${babies.length}`
  );
  return { total: babies.length, success, failed };
}
