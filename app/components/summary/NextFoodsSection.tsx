import { ingredientEmojis } from "@/app/constants/emojis";
import type { NextFoodsData } from "@/app/types/summary";

export default function NextFoodsSection({ data }: { data: NextFoodsData }) {
  if (!data.recommendations.length) return null;

  return (
    <section className="bg-linear-to-br from-mint-50 to-emerald-50 rounded-3xl p-5 shadow-sm border border-mint-100 animate-section-enter section-delay-3 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🆕</span>
        <h2 className="font-semibold text-gray-800">Next Foods To Try</h2>
      </div>

      <div className="space-y-2.5">
        {data.recommendations.map((rec) => (
          <div
            key={rec.name}
            className="flex items-center gap-3 bg-white/80 rounded-2xl px-3.5 py-2.5 border border-white"
          >
            <span className="text-lg shrink-0">
              {ingredientEmojis[rec.name] || "🥘"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{rec.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{rec.reason}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-medium text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full">
                {rec.categoryLabel}
              </span>
              {rec.ageAppropriate && (
                <p className="text-[9px] text-emerald-500 mt-0.5">✓ age-ok</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.reason && (
        <p className="text-[10px] text-gray-400 mt-3">{data.reason}</p>
      )}
    </section>
  );
}
