import { afterEach, describe, expect, test, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("lib/ai/config", () => {
  test("normalizes custom weights when feature flag is enabled", async () => {
    process.env.NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED = "true";
    process.env.NEXT_FOOD_WEIGHT_CATEGORY_GAP = "0.8";
    process.env.NEXT_FOOD_WEIGHT_PREFERENCE = "0.4";
    process.env.NEXT_FOOD_WEIGHT_SIMILARITY = "0.4";

    const mod = await import("@/lib/ai/config");

    expect(mod.NEXT_FOOD_WEIGHTS.categoryGap).toBeCloseTo(0.5, 5);
    expect(mod.NEXT_FOOD_WEIGHTS.preference).toBeCloseTo(0.25, 5);
    expect(mod.NEXT_FOOD_WEIGHTS.similarity).toBeCloseTo(0.25, 5);
  });

  test("falls back to default weights when feature flag is disabled", async () => {
    process.env.NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED = "false";
    process.env.NEXT_FOOD_WEIGHT_CATEGORY_GAP = "0.1";
    process.env.NEXT_FOOD_WEIGHT_PREFERENCE = "0.1";
    process.env.NEXT_FOOD_WEIGHT_SIMILARITY = "0.8";

    const mod = await import("@/lib/ai/config");

    expect(mod.NEXT_FOOD_WEIGHTS).toEqual({
      categoryGap: 0.4,
      preference: 0.3,
      similarity: 0.3,
    });
  });

  test("sanitizes similarity pool to positive integer", async () => {
    process.env.NEXT_FOOD_SIMILARITY_POOL = "-7";
    const mod1 = await import("@/lib/ai/config");
    expect(mod1.NEXT_FOOD_SIMILARITY_POOL).toBe(20);

    vi.resetModules();
    process.env.NEXT_FOOD_SIMILARITY_POOL = "12.9";
    const mod2 = await import("@/lib/ai/config");
    expect(mod2.NEXT_FOOD_SIMILARITY_POOL).toBe(12);
  });
});
