import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import type { BabyFoodContext } from "./rag";

const EMBEDDING_MODEL = "text-embedding-3-small";

// ── Core Embedding Functions ──

/**
 * Generate an embedding vector for the given text using OpenAI.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in a single API call (batch).
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });

  // Sort by index to maintain order
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// ── Cosine Similarity ──

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

// ── Similarity Search ──

interface SimilarIngredient {
  ingredientId: number;
  name: string;
  category: string;
  similarity: number;
}

/**
 * Load all ingredient embeddings from the database.
 */
async function loadAllEmbeddings(): Promise<
  { ingredientId: number; name: string; category: string; embedding: number[] }[]
> {
  const rows = await prisma.ingredientEmbedding.findMany({
    include: { ingredient: true },
  });

  return rows.map((r) => ({
    ingredientId: r.ingredientId,
    name: r.ingredient.name,
    category: r.ingredient.category,
    embedding: r.embedding as number[],
  }));
}

/**
 * Find the top N ingredients most similar to a given ingredient.
 */
export async function findSimilarIngredients(
  ingredientId: number,
  topN: number = 5
): Promise<SimilarIngredient[]> {
  const allEmbeddings = await loadAllEmbeddings();

  const target = allEmbeddings.find((e) => e.ingredientId === ingredientId);
  if (!target) return [];

  const scored = allEmbeddings
    .filter((e) => e.ingredientId !== ingredientId)
    .map((e) => ({
      ingredientId: e.ingredientId,
      name: e.name,
      category: e.category,
      similarity: cosineSimilarity(target.embedding, e.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topN);
}

export interface SimilarFoodRecommendation {
  name: string;
  category: string;
  categoryLabel: string;
  similarity: number;
  basedOn: string; // The liked food it's similar to
  reason: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  KARBO: "Karbohidrat",
  PROTEIN_HEWANI: "Protein Hewani",
  PROTEIN_NABATI: "Protein Nabati",
  SAYURAN: "Sayuran",
  BUAH: "Buah",
};

/**
 * Find foods similar to the ones a baby already likes.
 * Filters out already-tried and allergy foods.
 * Returns top recommendations with similarity scores.
 */
export async function findSimilarToLiked(
  context: BabyFoodContext,
  topN: number = 8
): Promise<SimilarFoodRecommendation[]> {
  const allEmbeddings = await loadAllEmbeddings();
  if (allEmbeddings.length === 0) return [];

  const triedNames = new Set(context.triedFoods);
  const allergyNames = new Set(context.allergyFoods);
  const likedNames = context.likedFoods;

  if (likedNames.length === 0) return [];

  // Get embeddings for liked foods
  const likedEmbeddings = allEmbeddings.filter((e) =>
    likedNames.includes(e.name)
  );

  if (likedEmbeddings.length === 0) return [];

  // Get candidate foods (not tried, not allergenic)
  const candidates = allEmbeddings.filter(
    (e) => !triedNames.has(e.name) && !allergyNames.has(e.name)
  );

  // Score each candidate against all liked foods, keep best match
  const scored: SimilarFoodRecommendation[] = candidates.map((candidate) => {
    let bestSim = -1;
    let bestLikedName = "";

    for (const liked of likedEmbeddings) {
      const sim = cosineSimilarity(candidate.embedding, liked.embedding);
      if (sim > bestSim) {
        bestSim = sim;
        bestLikedName = liked.name;
      }
    }

    const catLabel = CATEGORY_LABELS[candidate.category] || candidate.category;

    return {
      name: candidate.name,
      category: candidate.category,
      categoryLabel: catLabel,
      similarity: Math.round(bestSim * 100),
      basedOn: bestLikedName,
      reason: `Mirip dengan ${bestLikedName} yang disukai bayi`,
    };
  });

  // Sort by similarity descending
  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topN);
}
