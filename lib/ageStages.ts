/**
 * Centralized MPASI age stages and food-stage guidance.
 * All age-based food logic should reference this module.
 */

export interface FoodStage {
  minMonths: number;
  maxMonths: number;
  label: string;
  description: string;
  texture: string;
  preferredCategories: string[];
  tips: string[];
}

/**
 * MPASI food stages aligned with WHO/IDAI guidelines.
 */
export const FOOD_STAGES: FoodStage[] = [
  {
    minMonths: 6,
    maxMonths: 8,
    label: "Early Solids (6-8 months)",
    description: "Introduce simple purees and mashed foods",
    texture: "smooth puree",
    preferredCategories: ["SAYURAN", "BUAH", "KARBO"],
    tips: [
      "Start with single-ingredient purees",
      "Wait 3-5 days between new foods to watch for reactions",
      "Begin with 1-2 tablespoons per feeding",
      "Breast milk or formula remains the main nutrition source",
    ],
  },
  {
    minMonths: 8,
    maxMonths: 10,
    label: "Mashed Foods (8-10 months)",
    description: "Introduce thicker textures and mixed foods",
    texture: "mashed with soft lumps",
    preferredCategories: [
      "PROTEIN_HEWANI",
      "PROTEIN_NABATI",
      "SAYURAN",
      "KARBO",
      "BUAH",
    ],
    tips: [
      "Introduce mashed foods with small soft lumps",
      "Start combining 2-3 ingredients together",
      "Introduce soft proteins like chicken and fish",
      "Increase portion sizes gradually",
    ],
  },
  {
    minMonths: 10,
    maxMonths: 12,
    label: "Finger Foods (10-12 months)",
    description: "Introduce soft finger foods",
    texture: "soft finger-sized pieces",
    preferredCategories: [
      "PROTEIN_HEWANI",
      "PROTEIN_NABATI",
      "SAYURAN",
      "KARBO",
      "BUAH",
    ],
    tips: [
      "Offer soft finger foods baby can pick up",
      "Try small pieces of banana, avocado, or cooked vegetables",
      "Encourage self-feeding to develop motor skills",
      "Supervise closely to prevent choking",
    ],
  },
  {
    minMonths: 12,
    maxMonths: 999,
    label: "Toddler Foods (12+ months)",
    description: "Family meals adapted for small hands",
    texture: "small bite-sized pieces",
    preferredCategories: [
      "PROTEIN_HEWANI",
      "PROTEIN_NABATI",
      "SAYURAN",
      "KARBO",
      "BUAH",
    ],
    tips: [
      "Can enjoy most family foods — just cut into small pieces",
      "Avoid choking hazards like whole grapes and nuts",
      "Honey is now safe to introduce",
      "Encourage eating with the family at mealtimes",
    ],
  },
];

/**
 * Get the food stage for a given age in months.
 */
export function getFoodStage(ageMonths: number): FoodStage {
  return (
    FOOD_STAGES.find(
      (s) => ageMonths >= s.minMonths && ageMonths < s.maxMonths
    ) || FOOD_STAGES[FOOD_STAGES.length - 1]
  );
}

/**
 * Get the recommended texture description for a given age.
 */
export function getTextureForAge(ageMonths: number): string {
  return getFoodStage(ageMonths).texture;
}

/**
 * Build a concise age context string for AI prompts.
 */
export function buildAgeContext(ageMonths: number): string {
  const stage = getFoodStage(ageMonths);
  return `Baby is ${ageMonths} months old (${stage.label}). Recommended texture: ${stage.texture}. ${stage.description}.`;
}
