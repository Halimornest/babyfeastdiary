import { generateStructuredAI } from "@/lib/ai/aiClient";
import { RecipeAIResponseSchema, type RecipeAIResponse } from "@/lib/ai/aiSchemas";
import type { WeeklyNutritionSummary } from "@/services/data/weeklyNutritionAggregator";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `You are BabyFeast AI, a baby food recipe creator specializing in MPASI.
Generate age-appropriate recipes based on the baby's data.
Match textures and complexity to the baby's developmental stage:
- 6-8 months: smooth purees only, single ingredients
- 8-10 months: mashed with soft lumps, simple combinations
- 10-12 months: soft finger foods, more variety
- 12+ months: small bite-sized family foods
Always avoid listed allergens. Prioritize foods baby already likes.`;

/**
 * Generate recipe suggestions using AI.
 * Input: pre-aggregated data (never raw logs).
 * Output: structured JSON with recipes array.
 */
export async function generateRecipeSuggestions(
  data: WeeklyNutritionSummary,
  count: number = 3
): Promise<RecipeAIResponse | null> {
  const likedFoods = data.mostLiked.slice(0, 6);
  const allergens = data.allergyFoods.slice(0, 10);
  const seasoningScope = await buildSeasoningScope(data.ageMonths);
  const userPrompt = `Generate ${count} baby-friendly recipes for this baby:

Baby Age: ${data.ageMonths} months (${data.foodStage})
Liked foods: ${likedFoods.join(", ") || "No preferences yet"}
Allergens to avoid: ${allergens.join(", ") || "None"}
Nutrition gaps: ${findGaps(data)}
Allowed seasonings: ${seasoningScope.allowedSeasonings.join(", ") || "None"}
Restricted seasonings: ${seasoningScope.restrictedSeasonings.join(", ") || "None"}

Return only JSON with root key "recipes".
For each recipe include keys: name, ageRange, texture, prepTime, ingredients[], steps[], nutritionHighlights[], tips[].`;

  try {
    const result = await generateStructuredAI<RecipeAIResponse>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 1200,
    });

    const parsed = RecipeAIResponseSchema.safeParse(result);
    if (parsed.success) return parsed.data;

    // Fallback 1: salvage partially structured model outputs.
    const normalized = normalizeRecipeResponse(result, count);
    if (normalized.recipes.length > 0) return normalized;
  } catch {
    // Fallback to deterministic recipes below.
  }

  // Fallback 2: deterministic recipes derived from weekly summary.
  return buildRuleBasedRecipes(data, count);
}

function normalizeRecipeResponse(input: unknown, count: number): RecipeAIResponse {
  const fallbackRoot = toRecord(input);
  const rawRecipes = toArray(fallbackRoot?.recipes);

  const recipes = rawRecipes
    .map((item, index) => normalizeRecipe(item, index + 1))
    .filter((item): item is RecipeAIResponse["recipes"][number] => item !== null)
    .slice(0, Math.max(1, count));

  return { recipes };
}

function normalizeRecipe(item: unknown, order: number): RecipeAIResponse["recipes"][number] | null {
  const record = toRecord(item);
  if (!record) return null;

  const name = asNonEmptyString(record.name) ?? `Recipe ${order}`;
  const ageRange = asNonEmptyString(record.ageRange) ?? "6+ months";
  const texture = asNonEmptyString(record.texture) ?? "Soft";
  const prepTime = asNonEmptyString(record.prepTime) ?? "10-15 min";

  const ingredients = toArray(record.ingredients)
    .map((ingredient) => {
      const ing = toRecord(ingredient);
      if (!ing) return null;
      const ingName = asNonEmptyString(ing.name);
      if (!ingName) return null;
      return {
        name: ingName,
        amount: asNonEmptyString(ing.amount) ?? "to taste",
        category: asNonEmptyString(ing.category) ?? "other",
      };
    })
    .filter((value): value is { name: string; amount: string; category: string } => value !== null);

  const steps = toArray(record.steps)
    .map(asNonEmptyString)
    .filter((value): value is string => Boolean(value));

  if (ingredients.length === 0 || steps.length === 0) {
    return null;
  }

  const nutritionHighlights = toArray(record.nutritionHighlights)
    .map(asNonEmptyString)
    .filter((value): value is string => Boolean(value));

  const tips = toArray(record.tips)
    .map(asNonEmptyString)
    .filter((value): value is string => Boolean(value));

  return {
    name,
    ageRange,
    texture,
    prepTime,
    ingredients,
    steps,
    nutritionHighlights,
    tips,
  };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function buildSeasoningScope(ageMonths: number): Promise<{
  allowedSeasonings: string[];
  restrictedSeasonings: string[];
}> {
  const allSeasonings = await prisma.seasoning.findMany({
    select: { name: true, minAgeMonths: true },
    orderBy: [{ minAgeMonths: "asc" }, { name: "asc" }],
  });

  return {
    allowedSeasonings: allSeasonings
      .filter((item) => ageMonths >= item.minAgeMonths)
      .map((item) => item.name),
    restrictedSeasonings: allSeasonings
      .filter((item) => ageMonths < item.minAgeMonths)
      .map((item) => item.name),
  };
}

function buildRuleBasedRecipes(
  data: WeeklyNutritionSummary,
  count: number
): RecipeAIResponse | null {
  if (data.mealsThisWeek <= 0) return null;

  const blocked = new Set(data.allergyFoods.map((f) => f.toLowerCase()));
  const candidates = Array.from(
    new Set(
      [...data.mostLiked, ...data.newFoods]
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && !blocked.has(f.toLowerCase()))
    )
  );

  if (candidates.length === 0) return null;

  const recipeCount = Math.max(1, Math.min(count, 3));
  const texture = data.ageMonths < 8
    ? "Smooth puree"
    : data.ageMonths < 10
      ? "Mashed soft"
      : data.ageMonths < 12
        ? "Soft finger food"
        : "Soft bite-sized";

  const recipes: RecipeAIResponse["recipes"] = [];

  for (let i = 0; i < recipeCount; i++) {
    const main = candidates[i % candidates.length];
    const side = candidates[(i + 1) % candidates.length];
    const suffix = data.ageMonths < 10 ? "Puree" : "Bowl";

    recipes.push({
      name: side && side !== main ? `${main} & ${side} ${suffix}` : `${main} ${suffix}`,
      ageRange: `${Math.max(6, data.ageMonths)}+ months`,
      texture,
      prepTime: "10-15 min",
      ingredients: [
        { name: main, amount: "2 tbsp", category: "mixed" },
        ...(side && side !== main ? [{ name: side, amount: "1 tbsp", category: "mixed" }] : []),
        { name: "Water", amount: "as needed", category: "liquid" },
      ],
      steps: [
        `Wash and prepare ${main}${side && side !== main ? ` and ${side}` : ""}.`,
        "Steam or boil until very soft.",
        data.ageMonths < 10
          ? "Blend or mash to age-appropriate texture."
          : "Chop finely and mash lightly for a soft texture.",
        "Serve warm and observe baby response.",
      ],
      nutritionHighlights: [
        "Supports gradual food variety.",
        "Uses foods from recent accepted intake.",
      ],
      tips: [
        "Start with a small portion and adjust texture slowly based on acceptance.",
      ],
    });
  }

  return { recipes };
}

function findGaps(data: WeeklyNutritionSummary): string {
  const dist = data.categoryDistribution;
  const gaps: string[] = [];
  if (dist.carbohydrates === 0) gaps.push("Carbohydrates");
  if (dist.animal_protein === 0) gaps.push("Animal Protein");
  if (dist.plant_protein === 0) gaps.push("Plant Protein");
  if (dist.vegetables === 0) gaps.push("Vegetables");
  if (dist.fruits === 0) gaps.push("Fruits");
  return gaps.length > 0 ? gaps.join(", ") + " missing" : "None — good balance!";
}
