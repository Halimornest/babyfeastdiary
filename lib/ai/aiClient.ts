import { openai } from "@/lib/openai";

/**
 * Centralized AI client wrapper.
 * All AI calls go through here for consistent model, temp, and token usage.
 */

const MODEL = "gpt-4o-mini";

const AI_RETRY_MAX_ATTEMPTS = Number(process.env.AI_RETRY_MAX_ATTEMPTS ?? 3);
const AI_RETRY_BASE_DELAY_MS = Number(process.env.AI_RETRY_BASE_DELAY_MS ?? 300);
const AI_GLOBAL_MAX_TOKENS = Number(process.env.AI_GLOBAL_MAX_TOKENS ?? 1200);

export interface AiClientOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryOpenAIError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeStatus = (error as { status?: unknown }).status;
  if (typeof maybeStatus === "number") {
    return maybeStatus === 429 || maybeStatus >= 500;
  }

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === "string") {
    return ["ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN"].includes(maybeCode);
  }

  return false;
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= AI_RETRY_MAX_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable = shouldRetryOpenAIError(error);
      if (!retryable || attempt === AI_RETRY_MAX_ATTEMPTS) {
        throw error;
      }

      const delay = AI_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(`AI request retry ${attempt}/${AI_RETRY_MAX_ATTEMPTS} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function resolveMaxTokens(requested: number): number {
  const safeRequested = Number.isFinite(requested) && requested > 0 ? requested : 1;
  const safeGlobal = Number.isFinite(AI_GLOBAL_MAX_TOKENS) && AI_GLOBAL_MAX_TOKENS > 0
    ? AI_GLOBAL_MAX_TOKENS
    : 1200;
  return Math.min(Math.floor(safeRequested), Math.floor(safeGlobal));
}

/**
 * Generate a structured JSON response from OpenAI.
 * Uses response_format to guarantee valid JSON.
 */
export async function generateStructuredAI<T>(
  options: AiClientOptions
): Promise<T | null> {
  const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 900 } = options;
  const resolvedMaxTokens = resolveMaxTokens(maxTokens);

  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt + "\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no extra text.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: resolvedMaxTokens,
      response_format: { type: "json_object" },
    })
  );

  const content = response.choices[0].message.content || "";
  try {
    return JSON.parse(content) as T;
  } catch {
    // Fallback: try cleaning markdown code fences
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      console.error("AI JSON parse failed:", content.slice(0, 200));
      return null;
    }
  }
}

/**
 * Generate a plain text AI response.
 */
export async function generateTextAI(
  options: AiClientOptions
): Promise<string> {
  const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 700 } = options;
  const resolvedMaxTokens = resolveMaxTokens(maxTokens);

  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: resolvedMaxTokens,
    })
  );

  return response.choices[0].message.content || "";
}
