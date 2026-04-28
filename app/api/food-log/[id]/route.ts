import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { invalidateBabyAiCaches } from "@/lib/ai-cache";
import { trackAiEvent } from "@/lib/observability/telemetry";

function parseFoodLogId(idParam: string): number | null {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const foodLogId = parseFoodLogId(id);
    if (!foodLogId) {
      return NextResponse.json({ error: "Invalid food log id" }, { status: 400 });
    }

    const foodLog = await prisma.foodLog.findUnique({
      where: { id: foodLogId },
      include: { baby: { select: { id: true, userId: true } } },
    });

    if (!foodLog || foodLog.baby.userId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.reaction.deleteMany({ where: { foodLogId } }),
      prisma.foodIngredient.deleteMany({ where: { foodLogId } }),
      prisma.foodSeasoning.deleteMany({ where: { foodLogId } }),
      prisma.foodLog.delete({ where: { id: foodLogId } }),
    ]);

    await invalidateBabyAiCaches(foodLog.baby.id);
    await trackAiEvent("food_log_deleted", {
      babyId: foodLog.baby.id,
      foodLogId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete food log error:", error);
    return NextResponse.json({ error: "Failed to delete food log" }, { status: 500 });
  }
}
