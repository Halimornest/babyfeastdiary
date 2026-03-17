import { generateStructuredAI } from "@/lib/ai/aiClient";
import {
  NutritionBalanceAIResponseSchema,
  type NutritionBalanceAIResponse,
} from "@/lib/ai/aiSchemas";
import { prisma } from "@/lib/prisma";
import { getBabyAgeInMonths } from "@/lib/babyAge";
import { getFoodStage } from "@/lib/ageStages";

export interface NutritionBalanceResult {
  categories: {
    name: string;
    emoji: string;
    count: number;
    percentage: number;
    status: "deficient" | "adequate" | "excellent";
  }[];
  overallBalance: "poor" | "fair" | "good" | "excellent";
  aiInsight: NutritionBalanceAIResponse | null;
  ageStage: string;
}

const CAT_META: Record<string, { name: string; emoji: string }> = {
  KARBO: { name: "Carbohydrates", emoji: "🍚" },
  PROTEIN_HEWANI: { name: "Animal Protein", emoji: "🥩" },
  PROTEIN_NABATI: { name: "Plant Protein", emoji: "🫘" },
  SAYURAN: { name: "Vegetables", emoji: "🥬" },
  BUAH: { name: "Fruits", emoji: "🍎" },
};

interface CategoryTarget {
  idealMin: number;
  idealMax: number;
}

export function getCategoryTargetsForAge(ageMonths: number): Record<string, CategoryTarget> {
  // Stage-aware defaults: early solids prioritize carbs/vegetables; older babies broaden proteins and fruit.
  if (ageMonths < 8) {
    return {
      KARBO: { idealMin: 20, idealMax: 40 },
      PROTEIN_HEWANI: { idealMin: 10, idealMax: 25 },
      PROTEIN_NABATI: { idealMin: 5, idealMax: 15 },
      SAYURAN: { idealMin: 20, idealMax: 35 },
      BUAH: { idealMin: 10, idealMax: 25 },
    };
  }

  if (ageMonths < 12) {
    return {
      KARBO: { idealMin: 15, idealMax: 35 },
      PROTEIN_HEWANI: { idealMin: 15, idealMax: 30 },
      PROTEIN_NABATI: { idealMin: 10, idealMax: 25 },
      SAYURAN: { idealMin: 15, idealMax: 30 },
      BUAH: { idealMin: 10, idealMax: 25 },
    };
  }

  return {
    KARBO: { idealMin: 15, idealMax: 35 },
    PROTEIN_HEWANI: { idealMin: 15, idealMax: 30 },
    PROTEIN_NABATI: { idealMin: 10, idealMax: 25 },
    SAYURAN: { idealMin: 15, idealMax: 30 },
    BUAH: { idealMin: 10, idealMax: 25 },
  };
}

const SYSTEM_PROMPT = `You are BabyFeast AI, a baby nutrition analyst.
Analyze the nutrition balance data and provide structured insights.
Factor in the baby's age when assessing nutrition needs.
Be encouraging and specific.`;

/**
 * Analyze nutrition balance: data computation + AI insight.
 * Combines the old analyzeNutritionBalance + nutrition-insight into one service.
 */
export async function analyzeNutritionBalanceService(
  babyId: number
): Promise<NutritionBalanceResult | null> {
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return null;

  const ageMonths = getBabyAgeInMonths(baby.birthDate);
  const stage = getFoodStage(ageMonths);
  const categoryTargets = getCategoryTargetsForAge(ageMonths);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const recentLogs = await prisma.foodLog.findMany({
    where: { babyId, date: { gte: twoWeeksAgo } },
    include: { ingredients: { include: { ingredient: true } } },
  });

  const catCounts: Record<string, number> = {
    KARBO: 0, PROTEIN_HEWANI: 0, PROTEIN_NABATI: 0, SAYURAN: 0, BUAH: 0,
  };

  for (const log of recentLogs) {
    for (const fi of log.ingredients) {
      catCounts[fi.ingredient.category] = (catCounts[fi.ingredient.category] || 0) + 1;
    }
  }

  const total = Object.values(catCounts).reduce((a, b) => a + b, 0);
  let balanceScore = 0;

  const categories = Object.entries(catCounts).map(([key, count]) => {
    const meta = CAT_META[key];
    const targets = categoryTargets[key] || { idealMin: 0, idealMax: 100 };
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    let status: "deficient" | "adequate" | "excellent";
    if (pct < targets.idealMin) {
      status = "deficient";
    } else if (pct > targets.idealMax) {
      status = "adequate";
      balanceScore += 1;
    } else {
      status = "excellent";
      balanceScore += 2;
    }

    return { name: meta.name, emoji: meta.emoji, count, percentage: pct, status };
  });

  let overallBalance: NutritionBalanceResult["overallBalance"];
  if (total === 0) overallBalance = "poor";
  else if (balanceScore >= 8) overallBalance = "excellent";
  else if (balanceScore >= 5) overallBalance = "good";
  else if (balanceScore >= 3) overallBalance = "fair";
  else overallBalance = "poor";

  // Generate structured AI insight
  let aiInsight: NutritionBalanceAIResponse | null = null;
  try {
    const compactCategories = categories
      .map((c) => `${c.name}:${c.percentage}%/${c.status}`)
      .join("; ");

    const aiResult = await generateStructuredAI<NutritionBalanceAIResponse>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Analyze this baby's nutrition balance:

Baby Age: ${ageMonths} months (${stage.label})
Overall Balance: ${overallBalance}
Categories: ${compactCategories}

Return only JSON with keys: summary, strengths, improvements, suggested_foods.`,
      maxTokens: 420,
    });

    const parsed = NutritionBalanceAIResponseSchema.safeParse(aiResult);
    aiInsight = parsed.success ? parsed.data : null;
  } catch {
    // AI insight is optional
  }

  return { categories, overallBalance, aiInsight, ageStage: stage.label };
}
