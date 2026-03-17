import type { SummaryData } from "@/app/types/summary";
import FoodChipsCompact from "@/app/components/summary/FoodChipsCompact";

export default function FavoriteFoodsSection({ data }: { data: SummaryData }) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-1 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">❤️</span>
        <h2 className="font-semibold text-gray-800">Favorite Foods</h2>
        {data.favoriteFoods.length > 0 && (
          <span className="ml-auto bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">
            {data.favoriteFoods.length}
          </span>
        )}
      </div>
      {data.favoriteFoods.length > 0 ? (
        <FoodChipsCompact
          foods={data.favoriteFoods}
          variant="favorite"
          previewCount={8}
        />
      ) : (
        <p className="text-sm text-gray-400">
          No favorites yet — log some reactions!
        </p>
      )}
    </section>
  );
}
