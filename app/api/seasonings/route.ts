import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const SEASONING_CATEGORIES = ["AROMATIC", "HERB", "SPICE", "FAT"] as const;

export async function GET(req: Request) {
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
    return NextResponse.json(seasonings, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch seasonings" },
      { status: 500 }
    );
  }
}
