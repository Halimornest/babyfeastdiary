import { z } from "zod";

export const babyIdQuerySchema = z.object({
  babyId: z.coerce.number().int().positive(),
});

export const aiChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  babyId: z.coerce.number().int().positive().optional(),
});

export const foodLogCreateSchema = z.object({
  babyId: z.coerce.number().int().positive(),
  ingredientIds: z.array(z.coerce.number().int().positive()).min(1),
  seasoningIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  cookingMethodId: z.coerce.number().int().positive().nullable().optional(),
  brothId: z.coerce.number().int().positive().nullable().optional(),
  note: z.string().max(1000).optional(),
});

export const reactionCreateSchema = z.object({
  foodLogId: z.coerce.number().int().positive(),
  liked: z.boolean().nullable().optional(),
  allergy: z.boolean().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  reactionIntensity: z.enum(["love", "like", "neutral", "dislike"]).nullable().optional(),
});

export function formatZodIssueMessage(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Invalid request";
  const field = first.path.length ? String(first.path[0]) : "payload";
  return `${field}: ${first.message}`;
}
