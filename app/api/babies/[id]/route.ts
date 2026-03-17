import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const babyId = Number(id);
    if (!Number.isInteger(babyId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const baby = await prisma.baby.findUnique({ where: { id: babyId } });
    if (!baby || baby.userId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const updated = await prisma.baby.update({
      where: { id: babyId },
      data: {
        name: body.name || baby.name,
        birthDate: body.birthDate ? new Date(body.birthDate) : baby.birthDate,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update baby error:", error);
    return NextResponse.json(
      { error: "Failed to update baby" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const babyId = Number(id);
    if (!Number.isInteger(babyId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const baby = await prisma.baby.findUnique({ where: { id: babyId } });
    if (!baby || baby.userId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete related data in correct order, then the baby
    await prisma.$transaction([
      prisma.reaction.deleteMany({ where: { foodLog: { babyId } } }),
      prisma.foodIngredient.deleteMany({ where: { foodLog: { babyId } } }),
      prisma.foodSeasoning.deleteMany({ where: { foodLog: { babyId } } }),
      prisma.foodLog.deleteMany({ where: { babyId } }),
      prisma.baby.delete({ where: { id: babyId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete baby error:", error);
    return NextResponse.json(
      { error: "Failed to delete baby" },
      { status: 500 }
    );
  }
}
