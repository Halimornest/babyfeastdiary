"use client";

import SelectableChip from "@/app/components/ui/SelectableChip";
import { ingredientEmojis, CATEGORIES, CATEGORY_META } from "@/app/constants/emojis";
import type { IngredientCategory, IngredientItem } from "@/app/types/food";

interface IngredientSelectorProps {
  filteredIngredients: IngredientItem[];
  groupedIngredients: Partial<Record<IngredientCategory, IngredientItem[]>> | null;
  activeCategory: "ALL" | IngredientCategory;
  setActiveCategory: (cat: "ALL" | IngredientCategory) => void;
  ingredientSearch: string;
  setIngredientSearch: (s: string) => void;
  selectedIngredients: number[];
  toggleIngredient: (id: number) => void;
  categoryCounts: Record<string, number>;
  ingBadgeAnim: boolean;
}

export default function IngredientSelector({
  filteredIngredients,
  groupedIngredients,
  activeCategory,
  setActiveCategory,
  ingredientSearch,
  setIngredientSearch,
  selectedIngredients,
  toggleIngredient,
  categoryCounts,
  ingBadgeAnim,
}: IngredientSelectorProps) {
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 animate-section-enter section-delay-1 hover:shadow-md transition-shadow duration-300">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🥗</span>
          <h2 className="font-semibold text-gray-800">Ingredients</h2>
          {selectedIngredients.length > 0 && (
            <span className={`ml-auto bg-peach-100 text-peach-700 text-xs font-bold px-2.5 py-1 rounded-full transition-transform duration-200 ${ingBadgeAnim ? "animate-badge-pop" : ""}`}>
              {selectedIngredients.length} selected
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200 hover:border-peach-300"
          />
          {ingredientSearch && (
            <button
              type="button"
              onClick={() => setIngredientSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white">
        <div className="px-5 py-3">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count = categoryCounts[cat.key] || 0;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`
                    flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold
                    transition-all duration-200 cursor-pointer select-none
                    ${isActive
                      ? "bg-peach-400 text-white shadow-md shadow-peach-300/40"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 border border-gray-100"
                    }
                  `}
                >
                  <span className="text-sm leading-none">{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-gray-200/70 text-gray-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-px bg-gray-100 mx-5" />
      </div>

      {/* Ingredient Chips */}
      <div className="p-5 pt-3">
        {filteredIngredients.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-sm text-gray-400">No ingredients found</p>
          </div>
        ) : activeCategory === "ALL" && groupedIngredients ? (
          <div className="space-y-4">
            {(Object.keys(CATEGORY_META) as IngredientCategory[]).map((catKey) => {
              const items = groupedIngredients[catKey];
              if (!items || items.length === 0) return null;
              const meta = CATEGORY_META[catKey];
              return (
                <div key={catKey}>
                  <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                    <span>{meta.emoji}</span> {meta.label}
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <SelectableChip
                        key={item.id}
                        label={item.name}
                        emoji={ingredientEmojis[item.name]}
                        selected={selectedIngredients.includes(item.id)}
                        onClick={() => toggleIngredient(item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredIngredients.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.name}
                emoji={ingredientEmojis[item.name]}
                selected={selectedIngredients.includes(item.id)}
                onClick={() => toggleIngredient(item.id)}
              />
            ))}
          </div>
        )}

        {selectedIngredients.length === 0 && (
          <p className="text-xs text-red-400 mt-3 flex items-center gap-1 animate-section-enter">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Select at least one ingredient
          </p>
        )}
      </div>
    </section>
  );
}
