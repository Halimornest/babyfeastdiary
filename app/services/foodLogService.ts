import type { IngredientItem, DataItem, SeasoningItem } from "@/app/types/food";

export interface FoodBuilderData {
  ingredients: IngredientItem[];
  cookingMethods: DataItem[];
  seasonings: SeasoningItem[];
  broths: DataItem[];
  babies: DataItem[];
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

async function parseJsonResponse(res: Response, label: string): Promise<unknown> {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: unknown }).error ?? `${label} request failed`)
        : `${label} request failed`;
    throw new Error(message);
  }
  return payload;
}

export async function fetchFoodBuilderData(): Promise<FoodBuilderData> {
  const [ingredientsRes, cookingRes, seasoningsRes, brothsRes, babiesRes] = await Promise.all([
    fetch("/api/ingredients"),
    fetch("/api/cooking-methods"),
    fetch("/api/seasonings"),
    fetch("/api/broths"),
    fetch("/api/babies"),
  ]);

  const [ingredientsRaw, cookingMethodsRaw, seasoningsRaw, brothsRaw, babiesRaw] = await Promise.all([
    parseJsonResponse(ingredientsRes, "Ingredients"),
    parseJsonResponse(cookingRes, "Cooking methods"),
    parseJsonResponse(seasoningsRes, "Seasonings"),
    parseJsonResponse(brothsRes, "Broths"),
    parseJsonResponse(babiesRes, "Babies"),
  ]);

  const ingredients = ensureArray<IngredientItem>(ingredientsRaw);
  const cookingMethods = ensureArray<DataItem>(cookingMethodsRaw);
  const seasonings = ensureArray<SeasoningItem>(seasoningsRaw);
  const broths = ensureArray<DataItem>(brothsRaw);
  const babies = ensureArray<DataItem>(babiesRaw);

  return { ingredients, cookingMethods, seasonings, broths, babies };
}

export interface SaveMealPayload {
  babyId: number;
  ingredientIds: number[];
  seasoningIds: number[];
  cookingMethodId: number | null;
  brothId: number | null;
  note?: string;
}

export async function saveMealLog(payload: SaveMealPayload) {
  const res = await fetch("/api/food-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to save meal log");
  }

  return data;
}
