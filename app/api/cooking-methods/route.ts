import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const methods = await prisma.cookingMethod.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(methods, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch cooking methods" },
      { status: 500 }
    );
  }
}
