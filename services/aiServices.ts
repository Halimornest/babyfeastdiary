import { generateStructuredAI, generateTextAI } from "@/lib/ai/aiClient"
import {
  BABY_AI_SYSTEM_PROMPT,
  WEEKLY_INSIGHT_PROMPT,
  RECIPE_PROMPT,
  DAILY_PLAN_PROMPT,
  WEEKLY_PLAN_PROMPT,
  RECOMMENDATION_PROMPT,
} from "@/lib/prompts"

export async function generateAIResponse(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  return generateTextAI({
    systemPrompt: systemPrompt || BABY_AI_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.7,
    maxTokens: 700,
  })
}

export async function generateAIResponseJSON<T>(
  prompt: string,
  systemPrompt?: string
): Promise<T | null> {
  return generateStructuredAI<T>({
    systemPrompt: systemPrompt || BABY_AI_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.7,
    maxTokens: 900,
  })
}

export async function generateWeeklyInsight(context: Record<string, unknown>): Promise<string> {
  const prompt = `${WEEKLY_INSIGHT_PROMPT}\n\nWeekly Data:\n${JSON.stringify(context)}`
  return generateAIResponse(prompt)
}

export async function generateRecipeSuggestions(context: Record<string, unknown>): Promise<string> {
  const prompt = `${RECIPE_PROMPT}\n\nBaby Context:\n${JSON.stringify(context)}`
  return generateAIResponse(prompt)
}

export async function generateFoodRecommendationsAI(context: Record<string, unknown>): Promise<string> {
  const prompt = `${RECOMMENDATION_PROMPT}\n\nBaby Context:\n${JSON.stringify(context)}`
  return generateAIResponse(prompt)
}

export async function generateDailyPlan(context: Record<string, unknown>): Promise<string> {
  const prompt = `${DAILY_PLAN_PROMPT}\n\nBaby Context:\n${JSON.stringify(context)}`
  return generateAIResponse(prompt)
}

export async function generateWeeklyMPASIPlan(context: Record<string, unknown>): Promise<string> {
  const prompt = `${WEEKLY_PLAN_PROMPT}\n\nBaby Context:\n${JSON.stringify(context)}`
  return generateAIResponse(prompt)
}