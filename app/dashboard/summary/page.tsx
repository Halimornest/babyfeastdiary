"use client";

import { Suspense } from "react";
import BottomNav from "../../components/BottomNav";
import BabySwitcher from "../../components/BabySwitcher";
import { useSummaryData } from "@/app/hooks/useSummaryData";
import FavoriteFoodsSection from "@/app/components/summary/FavoriteFoodsSection";
import AllergyFoodsSection from "@/app/components/summary/AllergyFoodsSection";
import TriedFoodsSection from "@/app/components/summary/TriedFoodsSection";
import FoodVarietySection from "@/app/components/summary/FoodVarietySection";
import WeeklyReportSection from "@/app/components/summary/WeeklyReportSection";
import NutritionBalanceSection from "@/app/components/summary/NutritionBalanceSection";
import NextFoodsSection from "@/app/components/summary/NextFoodsSection";
import RecipesSection from "@/app/components/summary/RecipesSection";
import TasteProfileSection from "@/app/components/summary/TasteProfileSection";
import { useBaby } from "@/app/components/BabyContext";
import { getAgeShortLabel, getBabyAgeInMonths } from "@/lib/babyAge";
import { getFoodStage } from "@/lib/ageStages";

function SummaryContent() {
  const { activeBaby } = useBaby();
  const {
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
  } = useSummaryData();

  type InsightSource = "cache" | "fresh" | "unknown";
  type SourceItem = { label: string; source: InsightSource; generatedAt?: string };

  const sourceItems = [
    {
      label: "Weekly",
      source: weeklyReport?._meta?.dataSource ?? "unknown",
      generatedAt: weeklyReport?._meta?.generatedAt,
    },
    {
      label: "Nutrition",
      source: nutritionBalance?._meta?.dataSource ?? "unknown",
      generatedAt: nutritionBalance?._meta?.generatedAt,
    },
    {
      label: "Recipes",
      source: recipes?._meta?.dataSource ?? "unknown",
      generatedAt: recipes?._meta?.generatedAt,
    },
  ] as SourceItem[];

  const visibleSourceItems = sourceItems.filter(
    (item): item is SourceItem & { source: "cache" | "fresh" } => item.source !== "unknown"
  );

  const latestInsightUpdate = visibleSourceItems
    .map((item) => item.generatedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  function sourceClass(source: "cache" | "fresh" | "unknown"): string {
    if (source === "fresh") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (source === "cache") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-50 text-gray-500 border-gray-200";
  }

  if (loading || babiesLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-peach-100 rounded-2xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="w-32 h-4 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-48 h-3 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="w-28 h-4 bg-gray-200 rounded-full animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-100 rounded-full animate-pulse" />
                <div className="w-3/4 h-3 bg-gray-50 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50 pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-peach-100 rounded-2xl flex items-center justify-center text-xl shrink-0">
            {"📊"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Summary</h1>
            <p className="text-xs text-gray-400">
              {activeBaby
                ? `${activeBaby.name} · ${getAgeShortLabel(new Date(activeBaby.birthDate))} · ${getFoodStage(getBabyAgeInMonths(new Date(activeBaby.birthDate))).label}`
                : "Your baby's food journey overview"}
            </p>
          </div>
          <BabySwitcher />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {!noBaby && (
          <div className="bg-white rounded-2xl border border-gray-100 px-3 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-gray-500">
                {latestInsightUpdate
                  ? `Last insight update: ${new Date(latestInsightUpdate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Last insight update: -"}
              </div>
              <button
                type="button"
                onClick={refreshInsights}
                disabled={loading || insightsLoading || babiesLoading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-peach-200 bg-white text-peach-700 text-xs font-semibold hover:bg-peach-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>↻</span>
                <span>{insightsLoading || loading ? "Refreshing..." : "Refresh Insights"}</span>
              </button>
            </div>

            {visibleSourceItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visibleSourceItems.map((item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium ${sourceClass(item.source)}`}
                  >
                    <span>{item.label}</span>
                    <span>•</span>
                    <span>{item.source === "fresh" ? "Fresh compute" : "From cache"}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {noBaby ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center animate-section-enter">
            <span className="text-4xl block mb-3">{"👶"}</span>
            <p className="text-gray-500 font-medium">No baby profile found</p>
            <p className="text-gray-400 text-sm mt-1">Add a baby in Profile to see their summary.</p>
          </div>
        ) : !data ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center animate-section-enter">
            <span className="text-4xl block mb-3">{"🍽️"}</span>
            <p className="text-gray-500 font-medium">No data yet</p>
            <p className="text-gray-400 text-sm mt-1">Start logging meals to see your summary!</p>
          </div>
        ) : (
          <>
            {/* Basic data sections */}
            <FavoriteFoodsSection data={data} />
            <AllergyFoodsSection data={data} />
            <TriedFoodsSection data={data} />

            {/* Weekly report + variety */}
            {weeklyReport && <FoodVarietySection report={weeklyReport} />}
            {weeklyReport && <WeeklyReportSection report={weeklyReport} />}

            {/* AI Insights loading indicator */}
            {insightsLoading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-peach-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Loading AI insights...</span>
              </div>
            )}
            {insightsError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-500 text-center">
                Some insights failed to load. Scroll down to see what&apos;s available.
              </div>
            )}

            {/* 5 Core AI Sections */}
            {nutritionBalance && <NutritionBalanceSection data={nutritionBalance} />}
            {nextFoods && <NextFoodsSection data={nextFoods} />}
            {recipes && <RecipesSection data={recipes} />}
            {tasteProfile && <TasteProfileSection data={tasteProfile} />}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense>
      <SummaryContent />
    </Suspense>
  );
}
