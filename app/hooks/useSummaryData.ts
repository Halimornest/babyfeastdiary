"use client";

import { useCallback, useEffect, useState } from "react";
import { useBaby } from "@/app/components/BabyContext";
import { fetchBasicSummary, fetchAiInsights } from "@/app/services/summaryService";
import type {
  SummaryData,
  WeeklyReportData,
  NutritionBalanceData,
  NextFoodsData,
  RecipeSuggestionsData,
  TasteProfileData,
} from "@/app/types/summary";

export interface UseSummaryDataReturn {
  data: SummaryData | null;
  weeklyReport: WeeklyReportData | null;
  nutritionBalance: NutritionBalanceData | null;
  nextFoods: NextFoodsData | null;
  recipes: RecipeSuggestionsData | null;
  tasteProfile: TasteProfileData | null;
  loading: boolean;
  insightsLoading: boolean;
  insightsError: boolean;
  noBaby: boolean;
  babiesLoading: boolean;
  refreshInsights: () => void;
}

export function useSummaryData(): UseSummaryDataReturn {
  const { activeBabyId, babies, loading: babiesLoading } = useBaby();

  const [data, setData] = useState<SummaryData | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData | null>(null);
  const [nutritionBalance, setNutritionBalance] = useState<NutritionBalanceData | null>(null);
  const [nextFoods, setNextFoods] = useState<NextFoodsData | null>(null);
  const [recipes, setRecipes] = useState<RecipeSuggestionsData | null>(null);
  const [tasteProfile, setTasteProfile] = useState<TasteProfileData | null>(null);
  const [summaryLoadedFor, setSummaryLoadedFor] = useState<number | null>(null);
  const [insightsLoadedFor, setInsightsLoadedFor] = useState<number | null>(null);
  const [insightsError, setInsightsError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const noBaby = !babiesLoading && babies.length === 0;
  const babyId = activeBabyId;

  const loading = babyId != null && babyId !== summaryLoadedFor;
  const insightsLoading = babyId != null && babyId !== insightsLoadedFor;

  const refreshInsights = useCallback(() => {
    if (!babyId) return;
    setSummaryLoadedFor(null);
    setInsightsLoadedFor(null);
    setInsightsError(false);
    setRefreshKey((value) => value + 1);
  }, [babyId]);

  // Fetch basic summary
  useEffect(() => {
    if (!babyId) return;
    let cancelled = false;
    fetchBasicSummary(babyId)
      .then((d) => { if (!cancelled) { setData(d); setSummaryLoadedFor(babyId); } })
      .catch((err) => console.error("Failed to load summary:", err))
    return () => { cancelled = true; };
  }, [babyId, refreshKey]);

  // Fetch 5 core AI insights
  useEffect(() => {
    if (!babyId) return;
    let cancelled = false;

    fetchAiInsights(babyId)
      .then((result) => {
        if (cancelled) return;
        setWeeklyReport(result.weeklyReport);
        setNutritionBalance(result.nutritionBalance);
        setNextFoods(result.nextFoods);
        setRecipes(result.recipes);
        setTasteProfile(result.tasteProfile);
        setInsightsError(result.hasError);
        setInsightsLoadedFor(babyId);
      })
    return () => { cancelled = true; };
  }, [babyId, refreshKey]);

  return {
    data,
    weeklyReport,
    nutritionBalance,
    nextFoods,
    recipes,
    tasteProfile,
    loading,
    insightsLoading,
    insightsError,
    noBaby,
    babiesLoading,
    refreshInsights,
  };
}
