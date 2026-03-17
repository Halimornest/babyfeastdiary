import { z } from "zod";

/**
 * TypeScript schemas for structured AI JSON responses.
 * These define the expected shape of AI outputs.
 */

/** Weekly Nutrition AI insight response */
export const WeeklyInsightAIResponseSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  suggested_foods: z.array(z.string()),
});
export type WeeklyInsightAIResponse = z.infer<typeof WeeklyInsightAIResponseSchema>;

/** Nutrition Balance AI insight response */
export const NutritionBalanceAIResponseSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  suggested_foods: z.array(z.string()),
});
export type NutritionBalanceAIResponse = z.infer<typeof NutritionBalanceAIResponseSchema>;

/** Recipe AI response */
export const RecipeAIResponseSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string(),
      ageRange: z.string(),
      texture: z.string(),
      prepTime: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
          category: z.string(),
        })
      ),
      steps: z.array(z.string()),
      nutritionHighlights: z.array(z.string()),
      tips: z.array(z.string()),
    })
  ),
});
export type RecipeAIResponse = z.infer<typeof RecipeAIResponseSchema>;
