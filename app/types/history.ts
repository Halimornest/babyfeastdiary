export interface HistoryIngredient {
  id: number;
  ingredient: { id: number; name: string };
}

export interface HistorySeasoning {
  id: number;
  seasoning: { id: number; name: string };
}

export interface HistoryReaction {
  id: number;
  liked: boolean | null;
  allergy: boolean | null;
  note: string | null;
}

export interface FoodLog {
  id: number;
  date: string;
  note: string | null;
  ingredients: HistoryIngredient[];
  seasonings: HistorySeasoning[];
  cookingMethod: { id: number; name: string } | null;
  broth: { id: number; name: string } | null;
  reaction: HistoryReaction | null;
}
