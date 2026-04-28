import { NextResponse } from "next/server";

interface RequestLogContext {
  route: string;
  method?: string;
  userId?: number;
  babyId?: number;
  meta?: Record<string, unknown>;
}

export function buildRequestLog(req: Request, ctx: RequestLogContext) {
  const start = Date.now();

  return {
    ok(status: number, extra?: Record<string, unknown>) {
      log("info", {
        event: "api_success",
        route: ctx.route,
        method: ctx.method ?? req.method,
        status,
        durationMs: Date.now() - start,
        userId: ctx.userId,
        babyId: ctx.babyId,
        ...ctx.meta,
        ...extra,
      });
    },
    fail(error: unknown, status: number, extra?: Record<string, unknown>) {
      const detail = normalizeError(error);
      log(status >= 500 ? "error" : "warn", {
        event: "api_error",
        route: ctx.route,
        method: ctx.method ?? req.method,
        status,
        durationMs: Date.now() - start,
        userId: ctx.userId,
        babyId: ctx.babyId,
        ...ctx.meta,
        ...extra,
        errorName: detail.name,
        errorMessage: detail.message,
        errorCode: detail.code,
      });
    },
  };
}

export function mapDatabaseError(error: unknown): { status: number; message: string } {
  const msg = normalizeError(error).message.toLowerCase();
  if (msg.includes("maxclientsinsessionmode") || msg.includes("too many clients") || msg.includes("pool")) {
    return { status: 503, message: "Database is busy. Please retry in a moment." };
  }
  return { status: 500, message: "Internal server error" };
}

export function jsonError(error: unknown, fallbackMessage: string) {
  const mapped = mapDatabaseError(error);
  return NextResponse.json({ error: mapped.status === 500 ? fallbackMessage : mapped.message }, { status: mapped.status });
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    const anyErr = error as Error & { code?: string };
    return { name: error.name, message: error.message, code: anyErr.code };
  }

  if (error && typeof error === "object") {
    const maybe = error as { name?: unknown; message?: unknown; code?: unknown };
    return {
      name: typeof maybe.name === "string" ? maybe.name : "UnknownError",
      message: typeof maybe.message === "string" ? maybe.message : "Unknown error",
      code: typeof maybe.code === "string" ? maybe.code : undefined,
    };
  }

  return { name: "UnknownError", message: String(error), code: undefined };
}

function log(level: "info" | "warn" | "error", payload: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, ...payload });
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
