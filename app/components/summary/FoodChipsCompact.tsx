"use client";

import { useState } from "react";
import { ingredientEmojis } from "@/app/constants/emojis";

type Variant = "favorite" | "allergy" | "tried" | "new" | "disliked";

interface FoodChipsCompactProps {
  foods: string[];
  variant: Variant;
  previewCount?: number;
  emptyState?: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, { chip: string; icon: string }> = {
  favorite: {
    chip: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    icon: "❤️",
  },
  allergy: {
    chip: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
    icon: "⚠️",
  },
  tried: {
    chip: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-peach-50 hover:border-peach-200 hover:text-peach-700",
    icon: "🍽️",
  },
  new: {
    chip: "bg-mint-50 text-mint-700 border-mint-200 hover:bg-mint-100",
    icon: "🆕",
  },
  disliked: {
    chip: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    icon: "😕",
  },
};

export default function FoodChipsCompact({
  foods,
  variant,
  previewCount = 10,
  emptyState,
}: FoodChipsCompactProps) {
  const [expanded, setExpanded] = useState(false);

  if (foods.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  const visibleFoods = expanded ? foods : foods.slice(0, previewCount);
  const hiddenCount = foods.length - visibleFoods.length;
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {visibleFoods.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className={`inline-flex items-center gap-1.5 min-w-0 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${styles.chip}`}
            title={name}
          >
            <span className="shrink-0">{ingredientEmojis[name] || "🥘"}</span>
            <span className="truncate">{name}</span>
          </span>
        ))}
      </div>

      {foods.length > previewCount && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-peach-700 hover:text-peach-800 transition-colors"
        >
          <span>{styles.icon}</span>
          <span>{expanded ? "Show less" : `Show all (${hiddenCount} more)`}</span>
        </button>
      )}
    </div>
  );
}