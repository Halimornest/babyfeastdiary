import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buildRequestLog, jsonError } from "@/lib/observability/http";

export async function GET(req: Request) {
  const reqLog = buildRequestLog(req, { route: "/api/ingredients" });
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
    });
    reqLog.ok(200, { count: ingredients.length });
    return NextResponse.json(ingredients, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    reqLog.fail(error, 500);
    return jsonError(error, "Failed to fetch ingredients");
  }
}
