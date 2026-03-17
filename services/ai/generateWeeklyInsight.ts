import { generateStructuredAI } from "@/lib/ai/aiClient";
import {
  WeeklyInsightAIResponseSchema,
  type WeeklyInsightAIResponse,
} from "@/lib/ai/aiSchemas";
import type { WeeklyNutritionSummary } from "@/services/data/weeklyNutritionAggregator";

const SYSTEM_PROMPT = `You are BabyFeast AI, a baby nutrition analyst specializing in MPASI (complementary feeding for babies 6+ months).
Analyze the weekly nutrition data and provide structured insights.
Consider the baby's age stage when giving advice.
Be encouraging, specific, and actionable.`;

/**
 * Generate AI insight for weekly nutrition report.
 * Input: pre-aggregated WeeklyNutritionSummary (never raw logs).
 * Output: structured JSON with summary, strengths, improvements, suggested_foods.
 */
export async function generateWeeklyInsight(
  data: WeeklyNutritionSummary
): Promise<WeeklyInsightAIResponse | null> {
  const newFoods = data.newFoods.slice(0, 10);
  const mostLiked = data.mostLiked.slice(0, 8);
  const allergies = data.allergyFoods.slice(0, 8);

  const userPrompt = `Analyze this baby's weekly nutrition data and return a JSON response:

Baby Age: ${data.ageMonths} months (${data.foodStage})
Meals this week: ${data.mealsThisWeek}
New foods introduced: ${newFoods.length > 0 ? newFoods.join(", ") : "None"}
Category distribution: carbs=${data.categoryDistribution.carbohydrates}, animalProtein=${data.categoryDistribution.animal_protein}, plantProtein=${data.categoryDistribution.plant_protein}, vegetables=${data.categoryDistribution.vegetables}, fruits=${data.categoryDistribution.fruits}
Most liked foods: ${mostLiked.join(", ") || "None yet"}
Allergies: ${allergies.join(", ") || "None"}
Variety score: ${data.varietyScore}/100

Return only JSON with keys: summary, strengths, improvements, suggested_foods.`;

  const result = await generateStructuredAI<WeeklyInsightAIResponse>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 500,
  });

  const parsed = WeeklyInsightAIResponseSchema.safeParse(result);
  return parsed.success ? parsed.data : null;
}
