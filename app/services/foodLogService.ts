import type { IngredientItem, DataItem, SeasoningItem } from "@/app/types/food";
import { fetchWithTimeoutAndRetry } from "@/lib/fetch-with-retry";

export interface FoodBuilderData {
  ingredients: IngredientItem[];
  cookingMethods: DataItem[];
  seasonings: SeasoningItem[];
  broths: DataItem[];
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
  const [ingredientsRes, cookingRes, seasoningsRes, brothsRes] = await Promise.all([
    fetchWithTimeoutAndRetry("/api/ingredients", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
    fetchWithTimeoutAndRetry("/api/cooking-methods", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
    fetchWithTimeoutAndRetry("/api/seasonings", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
    fetchWithTimeoutAndRetry("/api/broths", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
  ]);

  const [ingredientsRaw, cookingMethodsRaw, seasoningsRaw, brothsRaw] = await Promise.all([
    parseJsonResponse(ingredientsRes, "Ingredients"),
    parseJsonResponse(cookingRes, "Cooking methods"),
    parseJsonResponse(seasoningsRes, "Seasonings"),
    parseJsonResponse(brothsRes, "Broths"),
  ]);

  const ingredients = ensureArray<IngredientItem>(ingredientsRaw);
  const cookingMethods = ensureArray<DataItem>(cookingMethodsRaw);
  const seasonings = ensureArray<SeasoningItem>(seasoningsRaw);
  const broths = ensureArray<DataItem>(brothsRaw);

  return { ingredients, cookingMethods, seasonings, broths };
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
  const res = await fetchWithTimeoutAndRetry(
    "/api/food-log",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { timeoutMs: 15000, retries: 1, retryDelayMs: 300 }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to save meal log");
  }

  return data;
}
