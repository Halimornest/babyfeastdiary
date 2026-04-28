import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { buildRequestLog, jsonError } from "@/lib/observability/http";

const SEASONING_CATEGORIES = ["AROMATIC", "HERB", "SPICE", "FAT"] as const;

export async function GET(req: Request) {
  const reqLog = buildRequestLog(req, { route: "/api/seasonings" });
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");
    const category =
      categoryParam && SEASONING_CATEGORIES.includes(categoryParam as (typeof SEASONING_CATEGORIES)[number])
        ? (categoryParam as (typeof SEASONING_CATEGORIES)[number])
        : null;

    const seasonings = await prisma.seasoning.findMany({
      where: category ? { category } : undefined,
      orderBy: [
        { name: "asc" },
      ],
    });
    reqLog.ok(200, { count: seasonings.length, category: category ?? "ALL" });
    return NextResponse.json(seasonings, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    reqLog.fail(error, 500);
    return jsonError(error, "Failed to fetch seasonings");
  }
}
