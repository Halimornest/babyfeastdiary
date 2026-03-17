import { prisma } from "@/lib/prisma";
import { generateEmbeddingsBatch } from "@/lib/ai/embeddings";

const BATCH_SIZE = 50;

/**
 * Background job: generate embeddings for all ingredients that don't have one yet.
 * Uses batch API to minimize OpenAI calls.
 * Intended to run on the daily cron (idempotent — skips already-embedded ingredients).
 */
export async function runEmbeddingGeneration(): Promise<{
  total: number;
  generated: number;
  skipped: number;
  failed: number;
}> {
  // Find ingredients without embeddings
  const ingredients = await prisma.ingredient.findMany({
    where: { embedding: null },
    select: { id: true, name: true, category: true },
  });

  if (ingredients.length === 0) {
    console.log("[EmbeddingJob] All ingredients already have embeddings.");
    return { total: 0, generated: 0, skipped: 0, failed: 0 };
  }

  let generated = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < ingredients.length; i += BATCH_SIZE) {
    const batch = ingredients.slice(i, i + BATCH_SIZE);

    // Build descriptive text for each ingredient (name + category for richer semantics)
    const texts = batch.map(
      (ing) => `${ing.name} (${ing.category.toLowerCase().replace(/_/g, " ")})`
    );

    try {
      const embeddings = await generateEmbeddingsBatch(texts);

      // Store each embedding in the database
      for (let j = 0; j < batch.length; j++) {
        try {
          await prisma.ingredientEmbedding.upsert({
            where: { ingredientId: batch[j].id },
            update: {
              embedding: embeddings[j],
              updatedAt: new Date(),
            },
            create: {
              ingredientId: batch[j].id,
              embedding: embeddings[j],
            },
          });
          generated++;
        } catch (dbErr) {
          console.error(
            `[EmbeddingJob] DB write failed for ${batch[j].name}:`,
            dbErr
          );
          failed++;
        }
      }
    } catch (apiErr) {
      console.error(
        `[EmbeddingJob] OpenAI batch failed (batch ${i / BATCH_SIZE + 1}):`,
        apiErr
      );
      failed += batch.length;
    }
  }

  const skipped = 0; // All selected ingredients lacked embeddings
  console.log(
    `[EmbeddingJob] Done — ${generated} generated, ${failed} failed out of ${ingredients.length}`
  );

  return { total: ingredients.length, generated, skipped, failed };
}
