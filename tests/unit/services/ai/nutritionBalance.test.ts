import { describe, expect, test } from "vitest";

describe("services/ai/nutritionBalance.getCategoryTargetsForAge", () => {
  test("returns early-solids target ranges for 6-7 months", async () => {
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-key";
    const { getCategoryTargetsForAge } = await import("@/services/ai/nutritionBalance");
    const targets = getCategoryTargetsForAge(7);
    expect(targets.KARBO).toEqual({ idealMin: 20, idealMax: 40 });
    expect(targets.PROTEIN_NABATI).toEqual({ idealMin: 5, idealMax: 15 });
  });

  test("returns transitional target ranges for 8-11 months", async () => {
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-key";
    const { getCategoryTargetsForAge } = await import("@/services/ai/nutritionBalance");
    const targets = getCategoryTargetsForAge(9);
    expect(targets.PROTEIN_HEWANI).toEqual({ idealMin: 15, idealMax: 30 });
    expect(targets.SAYURAN).toEqual({ idealMin: 15, idealMax: 30 });
  });

  test("returns toddler target ranges for 12+ months", async () => {
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-key";
    const { getCategoryTargetsForAge } = await import("@/services/ai/nutritionBalance");
    const targets = getCategoryTargetsForAge(16);
    expect(targets.BUAH).toEqual({ idealMin: 10, idealMax: 25 });
    expect(targets.KARBO).toEqual({ idealMin: 15, idealMax: 35 });
  });
});
