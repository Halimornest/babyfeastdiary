import { categoryEmojis, categoryLabels } from "@/app/constants/emojis";
import type { WeeklyReportData } from "@/app/types/summary";
import FoodChipsCompact from "@/app/components/summary/FoodChipsCompact";

export default function WeeklyReportSection({ report }: { report: WeeklyReportData }) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-2 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">📅</span>
        <h2 className="font-semibold text-gray-800">Weekly Nutrition Report</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-purple-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{report.mealsThisWeek}</p>
          <p className="text-xs text-purple-400 font-medium">Meals this week</p>
        </div>
        <div className="bg-mint-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-mint-600">{report.newFoods}</p>
          <p className="text-xs text-mint-400 font-medium">New foods</p>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories this week</p>
        {Object.entries(report.categoryDistribution).map(([key, count]) => {
          const maxVal = Math.max(
            ...Object.values(report.categoryDistribution),
            1
          );
          const pct = (count / maxVal) * 100;

          return (
            <div key={key} className="flex items-center gap-2.5">
              <span className="text-sm w-5 text-center">{categoryEmojis[key]}</span>
              <span className="text-xs text-gray-600 w-28 shrink-0">{categoryLabels[key]}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      {/* New foods this week */}
      {report.newFoodNames.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New foods introduced</p>
          <FoodChipsCompact foods={report.newFoodNames} variant="new" previewCount={8} />
        </div>
      )}

      {/* Disliked this week */}
      {report.dislikedFoods.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Disliked</p>
          <FoodChipsCompact foods={report.dislikedFoods} variant="disliked" previewCount={6} />
        </div>
      )}

      {/* Allergy this week */}
      {report.allergyFoods.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Allergy reactions</p>
          <FoodChipsCompact foods={report.allergyFoods} variant="allergy" previewCount={6} />
        </div>
      )}

      {/* Favorites this week */}
      {report.favoriteFoods.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Most liked this week</p>
          <FoodChipsCompact foods={report.favoriteFoods} variant="favorite" previewCount={6} />
        </div>
      )}

      {/* AI Insight */}
      {report.aiInsight && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-2xl p-3 space-y-2">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">🤖 AI Insight</p>
            <p className="text-xs text-indigo-700 leading-relaxed">{report.aiInsight.summary}</p>

            {report.aiInsight.strengths.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-1">Strengths</p>
                <ul className="space-y-0.5">
                  {report.aiInsight.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-700 flex items-start gap-1">
                      <span className="shrink-0">✅</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.aiInsight.improvements.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-amber-600 uppercase mb-1">Improvements</p>
                <ul className="space-y-0.5">
                  {report.aiInsight.improvements.map((s, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                      <span className="shrink-0">💡</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.aiInsight.suggested_foods.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-indigo-600 uppercase mb-1">Suggested Foods</p>
                <div className="flex flex-wrap gap-1">
                  {report.aiInsight.suggested_foods.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
