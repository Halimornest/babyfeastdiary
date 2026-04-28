import { describe, expect, test } from "vitest";
import { mapDatabaseError } from "@/lib/observability/http";

describe("lib/observability/http.mapDatabaseError", () => {
  test("maps pool saturation errors to 503", () => {
    const mapped = mapDatabaseError(new Error("MaxClientsInSessionMode: max clients reached"));
    expect(mapped.status).toBe(503);
    expect(mapped.message).toContain("busy");
  });

  test("maps unknown errors to 500", () => {
    const mapped = mapDatabaseError(new Error("unexpected"));
    expect(mapped.status).toBe(500);
  });
});
