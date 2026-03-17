import ScoreRing from "@/app/components/ui/ScoreRing";
import type { WeeklyReportData } from "@/app/types/summary";

export default function FoodVarietySection({ report }: { report: WeeklyReportData }) {
  if (!report.varietyScore) return null;

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-1 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">📊</span>
        <h2 className="font-semibold text-gray-800">Food Variety Score</h2>
        <span
          className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
            report.varietyScore.level === "excellent"
              ? "bg-emerald-50 text-emerald-600"
              : report.varietyScore.level === "moderate"
              ? "bg-amber-50 text-amber-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {report.varietyScore.level === "excellent"
            ? "Excellent!"
            : report.varietyScore.level === "moderate"
            ? "Good"
            : "Needs variety"}
        </span>
      </div>

      <ScoreRing
        score={report.varietyScore.score}
        level={report.varietyScore.level}
      />

      <p className="text-sm text-gray-600 text-center mt-4 leading-relaxed">
        {report.varietyScore.explanation}
      </p>
    </section>
  );
}
