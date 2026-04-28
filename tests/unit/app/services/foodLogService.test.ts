import { beforeEach, describe, expect, test, vi } from "vitest";

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

describe("app/services/foodLogService", () => {
  beforeEach(() => {
    fetchWithTimeoutAndRetry.mockReset();
  });

  test("fetchFoodBuilderData throws readable error when one endpoint fails", async () => {
    fetchWithTimeoutAndRetry
      .mockResolvedValueOnce(mockResponse({ error: "Ingredients down" }, false, 503));

    const { fetchFoodBuilderData } = await import("@/app/services/foodLogService");
    await expect(fetchFoodBuilderData()).rejects.toThrow("Ingredients down");
  });

  test("saveMealLog throws backend error message", async () => {
    fetchWithTimeoutAndRetry.mockResolvedValueOnce(mockResponse({ error: "Invalid baby" }, false, 400));
    const { saveMealLog } = await import("@/app/services/foodLogService");
    await expect(
      saveMealLog({
        babyId: 1,
        ingredientIds: [1],
        seasoningIds: [],
        cookingMethodId: null,
        brothId: null,
      })
    ).rejects.toThrow("Invalid baby");
  });
});
