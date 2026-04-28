import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buildRequestLog, jsonError } from "@/lib/observability/http";

export async function GET(req: Request) {
  const reqLog = buildRequestLog(req, { route: "/api/cooking-methods" });
  try {
    const methods = await prisma.cookingMethod.findMany({
      orderBy: { name: "asc" },
    });
    reqLog.ok(200, { count: methods.length });
    return NextResponse.json(methods, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    reqLog.fail(error, 500);
    return jsonError(error, "Failed to fetch cooking methods");
  }
}
