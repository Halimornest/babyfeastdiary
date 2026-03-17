import { NextResponse } from "next/server";
import { runNextFoodGeneration } from "@/jobs/generateNextFoodRecommendations";
import { runEmbeddingGeneration } from "@/jobs/generateIngredientEmbeddings";

/**
 * GET /api/cron/daily
 * Schedule: every day at midnight (0 0 * * *)
 *
 * Generates embeddings for new ingredients, then refreshes next-food recommendations.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate embeddings first (needed by similarity jobs)
    const embeddingResult = await runEmbeddingGeneration();

    const nextFoodResult = await runNextFoodGeneration();

    return NextResponse.json({
      ok: true,
      embeddings: embeddingResult,
      nextFood: nextFoodResult,
    });
  } catch (error) {
    console.error("[Cron/Daily] Error:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
