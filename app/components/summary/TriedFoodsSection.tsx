import type { SummaryData } from "@/app/types/summary";
import FoodChipsCompact from "@/app/components/summary/FoodChipsCompact";

export default function TriedFoodsSection({ data }: { data: SummaryData }) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-3 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🍽️</span>
        <h2 className="font-semibold text-gray-800">Tried Foods</h2>
        <span className="ml-auto bg-peach-50 text-peach-600 text-xs font-bold px-2.5 py-1 rounded-full">
          {data.triedFoods.length} foods
        </span>
      </div>
      <FoodChipsCompact
        foods={data.triedFoods}
        variant="tried"
        previewCount={10}
      />
    </section>
  );
}
