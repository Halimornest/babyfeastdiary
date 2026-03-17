"use client";

import BottomNav from "./BottomNav";
import BabySwitcher from "./BabySwitcher";
import { useFoodBuilder } from "@/app/hooks/useFoodBuilder";
import IngredientSelector from "@/app/components/food-builder/IngredientSelector";
import CookingMethodSelector from "@/app/components/food-builder/CookingMethodSelector";
import SeasoningSelector from "@/app/components/food-builder/SeasoningSelector";
import BrothSelector from "@/app/components/food-builder/BrothSelector";

export default function FoodBuilder() {
  const {
    cookingMethods,
    seasonings,
    broths,
    ingredientSearch,
    setIngredientSearch,
    activeCategory,
    setActiveCategory,
    filteredIngredients,
    groupedIngredients,
    categoryCounts,
    selectedIngredients,
    selectedCookingMethod,
    setSelectedCookingMethod,
    selectedSeasonings,
    selectedBroth,
    setSelectedBroth,
    note,
    setNote,
    toggleIngredient,
    toggleSeasoning,
    handleSubmit,
    error,
    isSubmitting,
    showSuccess,
    loading,
    ingBadgeAnim,
    seaBadgeAnim,
  } = useFoodBuilder();

  if (loading) {
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
        <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="w-28 h-4 bg-gray-200 rounded-full animate-pulse mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 + i }).map((_, j) => (
                  <div
                    key={j}
                    className="h-10 rounded-full animate-pulse"
                    style={{
                      width: `${60 + ((i * 17 + j * 31) % 40)}px`,
                      background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                      backgroundSize: "200% 100%",
                      animation: `shimmer 1.5s ease-in-out infinite, pulse 2s cubic-bezier(0.4,0,0.6,1) infinite`,
                      animationDelay: `${j * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50 pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-peach-100 rounded-2xl flex items-center justify-center text-xl shrink-0">
            {"🍼"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Baby Feast Diary
            </h1>
            <p className="text-xs text-gray-400">Log your baby&apos;s meal today</p>
          </div>
          <BabySwitcher />
        </div>
      </header>

      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-mint-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Meal log saved successfully!
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.516 9.82c.75 1.334-.213 2.981-1.742 2.981H4.483c-1.53 0-2.492-1.647-1.743-2.98l5.517-9.82zM11 13H9v-2h2v2zm0-4H9V7h2v2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <IngredientSelector
          filteredIngredients={filteredIngredients}
          groupedIngredients={groupedIngredients}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          ingredientSearch={ingredientSearch}
          setIngredientSearch={setIngredientSearch}
          selectedIngredients={selectedIngredients}
          toggleIngredient={toggleIngredient}
          categoryCounts={categoryCounts}
          ingBadgeAnim={ingBadgeAnim}
        />

        <CookingMethodSelector
          cookingMethods={cookingMethods}
          selectedCookingMethod={selectedCookingMethod}
          setSelectedCookingMethod={setSelectedCookingMethod}
        />

        <SeasoningSelector
          seasonings={seasonings}
          selectedSeasonings={selectedSeasonings}
          toggleSeasoning={toggleSeasoning}
          seaBadgeAnim={seaBadgeAnim}
        />

        <BrothSelector
          broths={broths}
          selectedBroth={selectedBroth}
          setSelectedBroth={setSelectedBroth}
        />

        {/* Notes */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-5 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{"📝"}</span>
            <h2 className="font-semibold text-gray-800">Notes</h2>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes about baby's reaction or meal..."
            rows={3}
            className="w-full bg-cream-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200 resize-none hover:border-peach-300 hover:shadow-sm"
          />
        </section>

        {/* Submit Button */}
        <div className="animate-section-enter section-delay-6">
          <button
            onClick={handleSubmit}
            disabled={selectedIngredients.length === 0 || isSubmitting}
            className={`
              w-full py-4 rounded-2xl text-base font-bold shadow-lg
              transition-all duration-300 flex items-center justify-center gap-2
              relative overflow-hidden
              ${
                selectedIngredients.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : isSubmitting
                  ? "bg-peach-300 text-white cursor-wait"
                  : "bg-linear-to-r from-peach-400 to-peach-500 text-white hover:from-peach-500 hover:to-peach-600 hover:shadow-xl hover:shadow-peach-300/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer animate-pulse-soft"
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <span className="text-lg transition-transform duration-200 group-hover:scale-125">{"✨"}</span>
                Save Meal Log
              </>
            )}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
