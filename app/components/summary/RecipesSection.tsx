import { ingredientEmojis } from "@/app/constants/emojis";
import type { RecipeSuggestionsData } from "@/app/types/summary";

export default function RecipesSection({ data }: { data: RecipeSuggestionsData }) {
  return (
    <section className="bg-linear-to-br from-orange-50 to-amber-50 rounded-3xl p-5 shadow-sm border border-orange-100 animate-section-enter section-delay-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">👩‍🍳</span>
        <h2 className="font-semibold text-gray-800">Recipe Suggestions</h2>
      </div>

      {data.recipes.length === 0 ? (
        <div className="bg-white/80 rounded-2xl p-4 border border-white text-center">
          <p className="text-sm font-medium text-gray-700">No recipe suggestions yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Add a few more meal logs, then tap Refresh Insights.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.recipes.map((recipe, i) => (
            <div key={i} className="bg-white/80 rounded-2xl p-4 border border-white">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-gray-800">{recipe.name}</p>
                <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  {recipe.prepTime}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Texture: {recipe.texture}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {recipe.ingredients.map((ing) => (
                  <span key={ing.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    {ingredientEmojis[ing.name] || "🥘"} {ing.name} ({ing.amount})
                  </span>
                ))}
              </div>

              <div className="space-y-1">
                {recipe.steps.map((step, j) => (
                  <p key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5 font-bold text-orange-500">{j + 1}.</span>
                    {step}
                  </p>
                ))}
              </div>

              {recipe.tips.length > 0 && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
                  💡 {recipe.tips[0]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
