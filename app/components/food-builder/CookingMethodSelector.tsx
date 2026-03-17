"use client";

import RadioCard from "@/app/components/ui/RadioCard";
import { cookingEmojis } from "@/app/constants/emojis";
import type { DataItem } from "@/app/types/food";

interface CookingMethodSelectorProps {
  cookingMethods: DataItem[];
  selectedCookingMethod: number | null;
  setSelectedCookingMethod: (id: number | null) => void;
}

export default function CookingMethodSelector({
  cookingMethods,
  selectedCookingMethod,
  setSelectedCookingMethod,
}: CookingMethodSelectorProps) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-2 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">👩‍🍳</span>
        <h2 className="font-semibold text-gray-800">Cooking Method</h2>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {cookingMethods.map((method) => (
          <RadioCard
            key={method.id}
            label={method.name}
            emoji={cookingEmojis[method.name]}
            selected={selectedCookingMethod === method.id}
            onClick={() =>
              setSelectedCookingMethod(
                selectedCookingMethod === method.id ? null : method.id
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
