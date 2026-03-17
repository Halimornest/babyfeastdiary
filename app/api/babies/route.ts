import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const babies = await prisma.baby.findMany({
      where: { userId: auth.userId },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(babies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch babies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, birthDate } = body;

    if (!name || !birthDate) {
      return NextResponse.json(
        { error: "Baby name and birth date are required" },
        { status: 400 }
      );
    }

    const baby = await prisma.baby.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        userId: auth.userId,
      },
    });

    return NextResponse.json(baby);
  } catch (error) {
    console.error("Create baby error:", error);
    return NextResponse.json(
      { error: "Failed to create baby profile" },
      { status: 500 }
    );
  }
}
