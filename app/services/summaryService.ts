import type {
  SummaryData,
  WeeklyReportData,
  NutritionBalanceData,
  NextFoodsData,
  RecipeSuggestionsData,
  TasteProfileData,
} from "@/app/types/summary";

function safeFetchNoStore<T>(url: string): Promise<T | null> {
  return fetch(url, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
}

export async function fetchBasicSummary(babyId: number): Promise<SummaryData | null> {
  return safeFetchNoStore(`/api/summary/${babyId}`);
}

export interface AiInsightsResult {
  weeklyReport: WeeklyReportData | null;
  nutritionBalance: NutritionBalanceData | null;
  nextFoods: NextFoodsData | null;
  recipes: RecipeSuggestionsData | null;
  tasteProfile: TasteProfileData | null;
  hasError: boolean;
}

/**
 * Fetch all 5 core AI insights in parallel.
 */
export async function fetchAiInsights(babyId: number): Promise<AiInsightsResult> {
  const [weeklyReport, nutritionBalance, nextFoods, recipes, tasteProfile] =
    await Promise.all([
      safeFetchNoStore<WeeklyReportData>(`/api/ai/weekly-report?babyId=${babyId}`),
      safeFetchNoStore<NutritionBalanceData>(`/api/ai/nutrition-balance?babyId=${babyId}`),
      safeFetchNoStore<NextFoodsData>(`/api/ai/next-foods?babyId=${babyId}`),
      safeFetchNoStore<RecipeSuggestionsData>(`/api/ai/recipes?babyId=${babyId}`),
      safeFetchNoStore<TasteProfileData>(`/api/ai/taste-profile?babyId=${babyId}`),
    ]);

  return {
    weeklyReport,
    nutritionBalance,
    nextFoods,
    recipes,
    tasteProfile,
    hasError: !weeklyReport && !nutritionBalance,
  };
}
