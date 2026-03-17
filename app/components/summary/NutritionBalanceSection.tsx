import type { NutritionBalanceData } from "@/app/types/summary";

const balanceColor: Record<string, string> = {
  excellent: "bg-emerald-50 text-emerald-600",
  good: "bg-blue-50 text-blue-600",
  fair: "bg-amber-50 text-amber-600",
  poor: "bg-red-50 text-red-500",
};

const statusIcon: Record<string, string> = {
  excellent: "🟢",
  adequate: "🔵",
  deficient: "🔴",
};

export default function NutritionBalanceSection({ data }: { data: NutritionBalanceData }) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-2 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚖️</span>
        <h2 className="font-semibold text-gray-800">Nutrition Balance</h2>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${balanceColor[data.overallBalance] ?? "bg-gray-50 text-gray-600"}`}>
          {data.overallBalance.charAt(0).toUpperCase() + data.overallBalance.slice(1)}
        </span>
      </div>

      {data.ageStage && (
        <p className="text-xs text-gray-400 mb-3">Stage: {data.ageStage}</p>
      )}

      <div className="space-y-2.5">
        {data.categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <span className="text-sm w-5 text-center">{cat.emoji}</span>
            <span className="text-xs text-gray-600 w-28 shrink-0">{cat.name}</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  cat.status === "excellent" ? "bg-emerald-400" :
                  cat.status === "adequate" ? "bg-blue-400" :
                  "bg-red-400"
                }`}
                style={{ width: `${Math.min(cat.percentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">{cat.percentage}%</span>
            <span className="text-xs w-4">{statusIcon[cat.status]}</span>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      {data.aiInsight && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-2xl p-3 space-y-2">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">🤖 AI Insight</p>
            <p className="text-xs text-indigo-700 leading-relaxed">{data.aiInsight.summary}</p>

            {data.aiInsight.improvements.length > 0 && (
              <ul className="space-y-0.5">
                {data.aiInsight.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                    <span className="shrink-0">💡</span> {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
