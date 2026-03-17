import type { DataItem } from "@/app/types/food";

interface BrothSelectorProps {
  broths: DataItem[];
  selectedBroth: number | null;
  setSelectedBroth: (id: number | null) => void;
}

export default function BrothSelector({ broths, selectedBroth, setSelectedBroth }: BrothSelectorProps) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter section-delay-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🍲</span>
        <h2 className="font-semibold text-gray-800">Broth</h2>
      </div>
      <div className="relative group">
        <select
          value={selectedBroth ?? ""}
          onChange={(e) =>
            setSelectedBroth(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full appearance-none bg-cream-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-700 font-medium focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200 cursor-pointer hover:border-peach-300 hover:shadow-sm"
        >
          <option value="">Select broth...</option>
          {broths.map((broth) => (
            <option key={broth.id} value={broth.id}>
              {broth.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg
            className="w-4 h-4 text-gray-400 transition-transform duration-200 group-focus-within:rotate-180 group-focus-within:text-peach-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
