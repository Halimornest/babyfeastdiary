import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const broths = await prisma.broth.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(broths, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch broths" },
      { status: 500 }
    );
  }
}
