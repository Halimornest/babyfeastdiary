import { NextResponse } from "next/server";
import { runWeeklyGeneration } from "@/jobs/generateWeeklyReports";
import { runNutritionInsightGeneration } from "@/jobs/generateNutritionInsights";
import { runRecipeLibraryGeneration } from "@/jobs/generateRecipeLibrary";

/**
 * GET /api/cron/weekly
 * Schedule: every Sunday (0 0 * * 0)
 *
 * Pre-generates weekly reports, meal plans, recipes,
 * nutrition insights, and recipe library for all babies.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [weeklyResult, nutritionResult, recipeLibraryResult] = await Promise.all([
      runWeeklyGeneration(),
      runNutritionInsightGeneration(),
      runRecipeLibraryGeneration(),
    ]);

    return NextResponse.json({
      ok: true,
      weekly: weeklyResult,
      nutritionInsights: nutritionResult,
      recipeLibrary: recipeLibraryResult,
    });
  } catch (error) {
    console.error("[Cron/Weekly] Error:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
