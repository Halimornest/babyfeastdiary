import { NextResponse } from "next/server";
import { runNextFoodGeneration } from "@/jobs/generateNextFoodRecommendations";
import { runSimilarFoodsPrecomputation } from "@/jobs/precomputeFoodSimilarity";

/**
 * GET /api/cron/next-food
 * Schedule: every 3 days (0 0 *\/3 * *)
 *
 * Pre-generates next food recommendations and similar food suggestions for all babies.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [nextFoodResult, similarFoodsResult] = await Promise.all([
      runNextFoodGeneration(),
      runSimilarFoodsPrecomputation(),
    ]);

    return NextResponse.json({
      ok: true,
      job: "next-food+similar-foods",
      nextFood: nextFoodResult,
      similarFoods: similarFoodsResult,
    });
  } catch (error) {
    console.error("[Cron/NextFood] Error:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
