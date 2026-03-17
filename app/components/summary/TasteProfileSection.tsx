import type { TasteProfileData } from "@/app/types/summary";

export default function TasteProfileSection({ data }: { data: TasteProfileData }) {
  if (!data.profile) return null;

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-1 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">👅</span>
        <h2 className="font-semibold text-gray-800">Taste Profile</h2>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
          data.profile.overallOpenness > 70 ? "bg-emerald-50 text-emerald-600" :
          data.profile.overallOpenness > 40 ? "bg-blue-50 text-blue-600" :
          "bg-amber-50 text-amber-600"
        }`}>
          {data.profile.overallOpenness > 70 ? "Adventurous!" :
           data.profile.overallOpenness > 40 ? "Open" : "Cautious"}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Food Openness</span>
          <span className="text-xs font-bold text-gray-700">{data.profile.overallOpenness}/100</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${data.profile.overallOpenness}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {data.profile.categoryAffinities.map((cat) => {
          const normalizedScore = ((cat.score + 1) / 2) * 100;
          return (
            <div key={cat.category} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center">{cat.emoji}</span>
              <span className="text-xs text-gray-600 w-28 shrink-0">{cat.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    cat.score > 0.3 ? "bg-emerald-400" : cat.score > 0 ? "bg-blue-400" : cat.score > -0.3 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${Math.max(normalizedScore, 5)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-6 text-right">
                {cat.score > 0.3 ? "❤️" : cat.score > 0 ? "👍" : cat.score > -0.3 ? "😐" : "👎"}
              </span>
            </div>
          );
        })}
      </div>

      {data.profile.strongLikes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Favorites</p>
          <div className="flex flex-wrap gap-1.5">
            {data.profile.strongLikes.slice(0, 6).map((name) => (
              <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                ❤️ {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
