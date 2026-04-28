import type {
  SummaryData,
  WeeklyReportData,
  NutritionBalanceData,
  NextFoodsData,
  RecipeSuggestionsData,
  TasteProfileData,
} from "@/app/types/summary";
import { fetchWithTimeoutAndRetry } from "@/lib/fetch-with-retry";

const SUMMARY_CACHE_TTL_MS = 30_000;
const summaryCache = new Map<number, { data: SummaryData | null; expiresAt: number }>();

export function invalidateSummaryCache(babyId?: number) {
  if (typeof babyId === "number") {
    summaryCache.delete(babyId);
    return;
  }
  summaryCache.clear();
}

function safeFetchNoStore<T>(url: string): Promise<T | null> {
  return fetchWithTimeoutAndRetry(
    url,
    { cache: "no-store" },
    { timeoutMs: 15000, retries: 1, retryDelayMs: 300 }
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
}

function isValidInsightPayload(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && !("error" in (value as Record<string, unknown>)));
}

export async function fetchBasicSummary(babyId: number): Promise<SummaryData | null> {
  const now = Date.now();
  const cached = summaryCache.get(babyId);
  if (cached && cached.expiresAt > now) return cached.data;
  const data = await safeFetchNoStore<SummaryData>(`/api/summary/${babyId}`);
  summaryCache.set(babyId, { data, expiresAt: now + SUMMARY_CACHE_TTL_MS });
  return data;
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
  // Stage requests to lower peak backend concurrency while keeping UI responsive.
  const [weeklyRaw, nutritionRaw] = await Promise.all([
    safeFetchNoStore<WeeklyReportData>(`/api/ai/weekly-report?babyId=${babyId}`),
    safeFetchNoStore<NutritionBalanceData>(`/api/ai/nutrition-balance?babyId=${babyId}`),
  ]);

  const [nextRaw, recipesRaw, tasteRaw] = await Promise.all([
    safeFetchNoStore<NextFoodsData>(`/api/ai/next-foods?babyId=${babyId}`),
    safeFetchNoStore<RecipeSuggestionsData>(`/api/ai/recipes?babyId=${babyId}`),
    safeFetchNoStore<TasteProfileData>(`/api/ai/taste-profile?babyId=${babyId}`),
  ]);

  const weeklyReport = isValidInsightPayload(weeklyRaw) ? weeklyRaw : null;
  const nutritionBalance = isValidInsightPayload(nutritionRaw) ? nutritionRaw : null;
  const nextFoods = isValidInsightPayload(nextRaw) ? nextRaw : null;
  const recipes = isValidInsightPayload(recipesRaw) ? recipesRaw : null;
  const tasteProfile = isValidInsightPayload(tasteRaw) ? tasteRaw : null;

  return {
    weeklyReport,
    nutritionBalance,
    nextFoods,
    recipes,
    tasteProfile,
    hasError: !weeklyReport && !nutritionBalance,
  };
}
