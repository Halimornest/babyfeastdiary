import type { SummaryData } from "@/app/types/summary";
import FoodChipsCompact from "@/app/components/summary/FoodChipsCompact";

export default function AllergyFoodsSection({ data }: { data: SummaryData }) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-2 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚠️</span>
        <h2 className="font-semibold text-gray-800">Allergy Foods</h2>
        {data.allergyFoods.length > 0 && (
          <span className="ml-auto bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {data.allergyFoods.length}
          </span>
        )}
      </div>
      {data.allergyFoods.length > 0 ? (
        <FoodChipsCompact
          foods={data.allergyFoods}
          variant="allergy"
          previewCount={8}
        />
      ) : (
        <div className="flex items-center gap-2 text-sm text-mint-600 bg-mint-50 rounded-xl px-3 py-2.5">
          <span>✅</span>
          <span>No allergy reactions recorded — great news!</span>
        </div>
      )}
    </section>
  );
}
