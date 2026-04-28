import { describe, expect, test, vi, beforeEach } from "vitest";

const fetchWithTimeoutAndRetry = vi.fn();

vi.mock("@/lib/fetch-with-retry", () => ({
  fetchWithTimeoutAndRetry,
}));

function mockResponse(payload: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => payload,
  } as Response;
}

describe("app/services/summaryService", () => {
  beforeEach(() => {
    fetchWithTimeoutAndRetry.mockReset();
  });

  test("fetchBasicSummary returns null on non-ok response", async () => {
    fetchWithTimeoutAndRetry.mockResolvedValueOnce(mockResponse({ error: "boom" }, false, 500));
    const { fetchBasicSummary } = await import("@/app/services/summaryService");

    const result = await fetchBasicSummary(7);
    expect(result).toBeNull();
  });

  test("fetchAiInsights keeps valid payloads and nulls invalid ones", async () => {
    fetchWithTimeoutAndRetry
      .mockResolvedValueOnce(mockResponse({ mealsThisWeek: 3, _meta: { dataSource: "cache" } }))
      .mockResolvedValueOnce(mockResponse({ categories: [], _meta: { dataSource: "fresh" } }))
      .mockResolvedValueOnce(mockResponse({ error: "temporary" }, false, 503))
      .mockResolvedValueOnce(mockResponse({ recipes: [] }))
      .mockResolvedValueOnce(mockResponse({ profile: null }));

    const { fetchAiInsights } = await import("@/app/services/summaryService");
    const result = await fetchAiInsights(9);

    expect(result.weeklyReport).not.toBeNull();
    expect(result.nutritionBalance).not.toBeNull();
    expect(result.nextFoods).toBeNull();
    expect(result.recipes).not.toBeNull();
    expect(result.tasteProfile).not.toBeNull();
    expect(result.hasError).toBe(false);
  });
});
