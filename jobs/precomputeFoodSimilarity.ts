import { prisma } from "@/lib/prisma";
import { getBabyFoodContext } from "@/lib/ai/rag";
import { findSimilarToLiked } from "@/lib/ai/embeddings";
import { setAiCache, similarFoodsKey, THREE_DAY_TTL } from "@/lib/ai-cache";

/**
 * Background job: precompute similar food recommendations for all babies.
 * Uses vector embeddings + cosine similarity to find foods similar to liked ones.
 * Intended to run every 3 days via cron trigger.
 */
export async function runSimilarFoodsPrecomputation(): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  // Check if any embeddings exist first
  const embeddingCount = await prisma.ingredientEmbedding.count();
  if (embeddingCount === 0) {
    console.log("[SimilarFoodsJob] No embeddings found. Run embedding generation first.");
    return { total: 0, success: 0, failed: 0 };
  }

  const babies = await prisma.baby.findMany({
    select: { id: true },
  });

  let success = 0;
  let failed = 0;

  for (const baby of babies) {
    try {
      const context = await getBabyFoodContext(baby.id);
      if (!context) {
        failed++;
        continue;
      }

      const similarFoods = await findSimilarToLiked(context, 8);

      const response = {
        similarFoods,
        totalEmbeddings: embeddingCount,
        basedOnLikedCount: context.likedFoods.length,
        disclaimer:
          "Rekomendasi ini berdasarkan kemiripan semantik bahan makanan. Bukan saran medis — selalu konsultasikan dengan dokter anak.",
      };

      await setAiCache(similarFoodsKey(baby.id), response, THREE_DAY_TTL);
      success++;
    } catch (error) {
      console.error(`[SimilarFoodsJob] Failed for baby ${baby.id}:`, error);
      failed++;
    }
  }

  console.log(
    `[SimilarFoodsJob] Done — ${success} ok, ${failed} failed out of ${babies.length}`
  );
  return { total: babies.length, success, failed };
}
