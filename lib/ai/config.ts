/**
 * Centralized AI and heuristic tuning config.
 * Values can be overridden via environment variables.
 */

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseUnitInterval(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : fallback;
}

export interface NextFoodWeights {
  categoryGap: number;
  preference: number;
  similarity: number;
}

const DEFAULT_NEXT_FOOD_WEIGHTS: NextFoodWeights = {
  categoryGap: 0.4,
  preference: 0.3,
  similarity: 0.3,
};

export const NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED = parseBoolean(
  process.env.NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED,
  true
);

const rawWeights: NextFoodWeights = NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED
  ? {
      categoryGap: parseUnitInterval(process.env.NEXT_FOOD_WEIGHT_CATEGORY_GAP, DEFAULT_NEXT_FOOD_WEIGHTS.categoryGap),
      preference: parseUnitInterval(process.env.NEXT_FOOD_WEIGHT_PREFERENCE, DEFAULT_NEXT_FOOD_WEIGHTS.preference),
      similarity: parseUnitInterval(process.env.NEXT_FOOD_WEIGHT_SIMILARITY, DEFAULT_NEXT_FOOD_WEIGHTS.similarity),
    }
  : DEFAULT_NEXT_FOOD_WEIGHTS;

const rawWeightTotal = rawWeights.categoryGap + rawWeights.preference + rawWeights.similarity;

// Keep behavior safe even if env vars are misconfigured.
export const NEXT_FOOD_WEIGHTS: NextFoodWeights = rawWeightTotal > 0
  ? {
      categoryGap: rawWeights.categoryGap / rawWeightTotal,
      preference: rawWeights.preference / rawWeightTotal,
      similarity: rawWeights.similarity / rawWeightTotal,
    }
  : DEFAULT_NEXT_FOOD_WEIGHTS;

export const NEXT_FOOD_SIMILARITY_POOL = Math.floor(
  parsePositiveNumber(process.env.NEXT_FOOD_SIMILARITY_POOL, 20)
);
