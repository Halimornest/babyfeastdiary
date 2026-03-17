import { redis } from "@/lib/redis";

export interface TelemetryPayload {
  [key: string]: string | number | boolean | null | undefined;
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function sanitizePayload(payload: TelemetryPayload): Record<string, string | number | boolean | null> {
  const entries = Object.entries(payload)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, value ?? null]);
  return Object.fromEntries(entries);
}

export async function trackAiEvent(eventName: string, payload: TelemetryPayload = {}): Promise<void> {
  const safePayload = sanitizePayload(payload);
  console.info(
    JSON.stringify({
      type: "ai_telemetry",
      event: eventName,
      timestamp: new Date().toISOString(),
      ...safePayload,
    })
  );

  // Best-effort daily counters for internal baseline metrics.
  const counterKey = `telemetry:ai:${eventName}:${todayStamp()}`;
  try {
    const count = await redis.incr(counterKey);
    if (count === 1) {
      await redis.expire(counterKey, 60 * 60 * 24 * 30);
    }
  } catch {
    // Keep telemetry non-blocking.
  }
}
