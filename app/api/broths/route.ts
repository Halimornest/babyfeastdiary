import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buildRequestLog, jsonError } from "@/lib/observability/http";

export async function GET(req: Request) {
  const reqLog = buildRequestLog(req, { route: "/api/broths" });
  try {
    const broths = await prisma.broth.findMany({
      orderBy: { name: "asc" },
    });
    reqLog.ok(200, { count: broths.length });
    return NextResponse.json(broths, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    reqLog.fail(error, 500);
    return jsonError(error, "Failed to fetch broths");
  }
}
