import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { invalidateBabyAiCaches } from "@/lib/ai-cache";
import { trackAiEvent } from "@/lib/observability/telemetry";
import { foodLogUpdateSchema, formatZodIssueMessage } from "@/lib/api/schemas";

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

export async function PATCH(
  req: Request,
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

    const parsed = foodLogUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodIssueMessage(parsed.error) },
        { status: 400 }
      );
    }

    const {
      ingredientIds,
      seasoningIds,
      cookingMethodId,
      brothId,
      note,
    } = parsed.data;

    const foodLog = await prisma.foodLog.findUnique({
      where: { id: foodLogId },
      select: {
        id: true,
        baby: { select: { id: true, userId: true } },
      },
    });

    if (!foodLog || foodLog.baby.userId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.foodIngredient.deleteMany({ where: { foodLogId } }),
      prisma.foodIngredient.createMany({
        data: ingredientIds.map((ingredientId) => ({ foodLogId, ingredientId })),
      }),
      prisma.foodSeasoning.deleteMany({ where: { foodLogId } }),
      ...(seasoningIds.length > 0
        ? [
            prisma.foodSeasoning.createMany({
              data: seasoningIds.map((seasoningId) => ({ foodLogId, seasoningId })),
            }),
          ]
        : []),
      prisma.foodLog.update({
        where: { id: foodLogId },
        data: {
          cookingMethodId: cookingMethodId ?? null,
          brothId: brothId ?? null,
          note: note ?? null,
        },
      }),
    ]);

    const updated = await prisma.foodLog.findUnique({
      where: { id: foodLogId },
      select: {
        id: true,
        date: true,
        note: true,
        ingredients: {
          select: {
            id: true,
            ingredient: { select: { id: true, name: true } },
          },
        },
        seasonings: {
          select: {
            id: true,
            seasoning: { select: { id: true, name: true, category: true } },
          },
        },
        cookingMethod: { select: { id: true, name: true } },
        broth: { select: { id: true, name: true } },
        reaction: {
          select: { id: true, liked: true, allergy: true, note: true },
        },
      },
    });

    await invalidateBabyAiCaches(foodLog.baby.id);
    await trackAiEvent("food_log_updated", {
      babyId: foodLog.baby.id,
      foodLogId,
      ingredientCount: ingredientIds.length,
      seasoningCount: seasoningIds.length,
      hasCookingMethod: Boolean(cookingMethodId),
      hasBroth: Boolean(brothId),
      hasNote: Boolean(note),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update food log error:", error);
    return NextResponse.json(
      { error: "Failed to update food log" },
      { status: 500 }
    );
  }
}
