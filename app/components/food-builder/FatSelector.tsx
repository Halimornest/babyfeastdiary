"use client";

import SelectableChip from "@/app/components/ui/SelectableChip";
import { seasoningEmojis } from "@/app/constants/emojis";
import type { SeasoningItem } from "@/app/types/food";

interface FatSelectorProps {
  fats: SeasoningItem[];
  selectedSeasonings: number[];
  toggleSeasoning: (id: number) => void;
}

export default function FatSelector({
  fats,
  selectedSeasonings,
  toggleSeasoning,
}: FatSelectorProps) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🫗</span>
        <h2 className="font-semibold text-gray-800">Lemak Nabati & Hewani</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {fats.map((item) => (
          <SelectableChip
            key={item.id}
            label={item.name}
            emoji={seasoningEmojis[item.name] || "🫗"}
            selected={selectedSeasonings.includes(item.id)}
            onClick={() => toggleSeasoning(item.id)}
          />
        ))}

        {fats.length === 0 && (
          <div className="py-6 text-center w-full">
            <span className="text-2xl block mb-2">🫗</span>
            <p className="text-sm text-gray-400">Belum ada data lemak</p>
          </div>
        )}
      </div>
    </section>
  );
}
