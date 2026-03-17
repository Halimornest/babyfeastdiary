"use client";

import { useMemo, useState } from "react";
import SelectableChip from "@/app/components/ui/SelectableChip";
import { seasoningEmojis } from "@/app/constants/emojis";
import type { SeasoningCategory, SeasoningItem } from "@/app/types/food";

interface SeasoningSelectorProps {
  seasonings: SeasoningItem[];
  selectedSeasonings: number[];
  toggleSeasoning: (id: number) => void;
  seaBadgeAnim: boolean;
}

const SEASONING_CATEGORIES: { key: "ALL" | SeasoningCategory; label: string; emoji: string }[] = [
  { key: "ALL", label: "Semua", emoji: "🧂" },
  { key: "AROMATIC", label: "Aromatic", emoji: "🧅" },
  { key: "HERB", label: "Herb", emoji: "🌿" },
  { key: "SPICE", label: "Spice", emoji: "🌶️" },
  { key: "FAT", label: "Fat", emoji: "🥑" },
];

export default function SeasoningSelector({
  seasonings,
  selectedSeasonings,
  toggleSeasoning,
  seaBadgeAnim,
}: SeasoningSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<"ALL" | SeasoningCategory>("ALL");
  const [search, setSearch] = useState("");

  const sorted = useMemo(
    () => (Array.isArray(seasonings) ? [...seasonings] : []).sort((a, b) => a.name.localeCompare(b.name)),
    [seasonings]
  );

  const filtered = useMemo(() => {
    return sorted.filter((item) => {
      const itemCategory = item.category ?? "AROMATIC";
      const matchCategory = activeCategory === "ALL" || itemCategory === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [sorted, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: sorted.length };
    for (const item of sorted) {
      const key = item.category ?? "AROMATIC";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [sorted]);

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-3 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🧂</span>
        <h2 className="font-semibold text-gray-800">Seasonings</h2>
        {selectedSeasonings.length > 0 && (
          <span className={`ml-auto bg-mint-100 text-mint-700 text-xs font-bold px-2.5 py-1 rounded-full transition-transform duration-200 ${seaBadgeAnim ? "animate-badge-pop" : ""}`}>
            {selectedSeasonings.length} selected
          </span>
        )}
      </div>

      <div className="relative mb-3">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seasonings..."
          className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200 hover:border-peach-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {SEASONING_CATEGORIES.map((cat) => {
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

      <div className="flex flex-wrap gap-2">
        {filtered.map((item) => (
          <SelectableChip
            key={item.id}
            label={item.name}
            emoji={seasoningEmojis[item.name] || "🧂"}
            selected={selectedSeasonings.includes(item.id)}
            onClick={() => toggleSeasoning(item.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="py-6 text-center w-full">
            <span className="text-2xl block mb-2">🔍</span>
            <p className="text-sm text-gray-400">No seasonings found</p>
          </div>
        )}
      </div>
    </section>
  );
}
