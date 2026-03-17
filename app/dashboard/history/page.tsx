"use client";

import { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav";
import BabySwitcher from "../../components/BabySwitcher";
import { useBaby } from "../../components/BabyContext";
import type { FoodLog } from "@/app/types/history";
import { ingredientEmojis, cookingEmojis, seasoningEmojis } from "@/app/constants/emojis";
import { formatRelativeDate as formatDate } from "@/app/utils/date";

export default function HistoryPage() {
  const { activeBabyId } = useBaby();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingReaction, setSavingReaction] = useState<number | null>(null);

  useEffect(() => {
    if (!activeBabyId) return;
    setLoading(true);
    fetch(`/api/food-log?babyId=${activeBabyId}`)
      .then((res) => res.json())
      .then((data) => setFoodLogs(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => setLoading(false));
  }, [activeBabyId]);

  const handleReaction = async (
    logId: number,
    type: "liked" | "disliked" | "allergy"
  ) => {
    setSavingReaction(logId);
    try {
      const res = await fetch("/api/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodLogId: logId,
          liked: type === "liked" ? true : type === "disliked" ? false : null,
          allergy: type === "allergy" ? true : false,
        }),
      });

      if (res.ok) {
        const reaction = await res.json();
        setFoodLogs((prev) =>
          prev.map((log) => (log.id === logId ? { ...log, reaction } : log))
        );
      }
    } catch (err) {
      console.error("Failed to save reaction:", err);
    } finally {
      setSavingReaction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-peach-100 rounded-2xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="w-28 h-4 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-44 h-3 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
                ))}
              </div>
              <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-4 w-full bg-gray-50 rounded-full animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />
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
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-peach-100 rounded-2xl flex items-center justify-center text-xl shrink-0">
            📋
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Meal History
            </h1>
            <p className="text-xs text-gray-400">
              See what your baby has eaten
            </p>
          </div>
          <BabySwitcher />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {foodLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center animate-section-enter">
            <span className="text-4xl block mb-3">🍽️</span>
            <p className="text-gray-500 font-medium">No meals logged yet</p>
            <p className="text-gray-400 text-sm mt-1">Start by adding your baby&apos;s first meal!</p>
          </div>
        ) : (
          foodLogs.map((log, index) => (
            <article
              key={log.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter hover:shadow-md transition-shadow duration-300"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
            >
              {/* Timestamp */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">
                  {formatDate(log.date)}
                </span>
                {log.cookingMethod && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-mint-700 bg-mint-50 px-2.5 py-1 rounded-full">
                    {cookingEmojis[log.cookingMethod.name] || "🍳"}{" "}
                    {log.cookingMethod.name}
                  </span>
                )}
              </div>

              {/* Ingredients */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {log.ingredients.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-peach-50 text-peach-800 border border-peach-200"
                  >
                    {ingredientEmojis[item.ingredient.name] || "🥘"}{" "}
                    {item.ingredient.name}
                  </span>
                ))}
              </div>

              {/* Seasonings */}
              {log.seasonings.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {log.seasonings.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cream-50 text-gray-600 border border-cream-200"
                    >
                      {seasoningEmojis[item.seasoning.name] || "🧂"}{" "}
                      {item.seasoning.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Broth */}
              {log.broth && (
                <p className="text-xs text-gray-500 mb-2">
                  🍲 Broth: <span className="font-medium">{log.broth.name}</span>
                </p>
              )}

              {/* Note */}
              {log.note && (
                <p className="text-xs text-gray-400 italic mb-3 bg-gray-50 rounded-xl px-3 py-2">
                  &quot;{log.note}&quot;
                </p>
              )}

              {/* Reaction Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleReaction(log.id, "liked")}
                  disabled={savingReaction === log.id}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
                    transition-all duration-200 cursor-pointer active:scale-95
                    ${
                      log.reaction?.liked === true
                        ? "bg-mint-100 text-mint-700 border-2 border-mint-300 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-mint-50 hover:text-mint-600 hover:border-mint-200"
                    }
                  `}
                >
                  👍 Liked
                </button>
                <button
                  onClick={() => handleReaction(log.id, "disliked")}
                  disabled={savingReaction === log.id}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
                    transition-all duration-200 cursor-pointer active:scale-95
                    ${
                      log.reaction?.liked === false
                        ? "bg-peach-100 text-peach-700 border-2 border-peach-300 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-peach-50 hover:text-peach-600 hover:border-peach-200"
                    }
                  `}
                >
                  👎 Disliked
                </button>
                <button
                  onClick={() => handleReaction(log.id, "allergy")}
                  disabled={savingReaction === log.id}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
                    transition-all duration-200 cursor-pointer active:scale-95
                    ${
                      log.reaction?.allergy === true
                        ? "bg-red-100 text-red-700 border-2 border-red-300 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    }
                  `}
                >
                  ⚠️ Allergy
                </button>
              </div>
            </article>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
