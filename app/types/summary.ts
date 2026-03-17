export interface SummaryData {
  favoriteFoods: string[];
  allergyFoods: string[];
  triedFoods: string[];
}

export interface InsightMeta {
  dataSource: "cache" | "fresh";
  generatedAt: string;
  cacheKey: string;
  cacheTtlSeconds: number;
}

// ═══════════════════════════════════════════════════════
// 5 CORE SECTIONS
// ═══════════════════════════════════════════════════════

/** Section 1: Weekly Nutrition Report */
export interface WeeklyReportData {
  mealsThisWeek: number;
  newFoods: number;
  newFoodNames: string[];
  favoriteFoods: string[];
  dislikedFoods: string[];
  allergyFoods: string[];
  categoryDistribution: {
    carbohydrates: number;
    animal_protein: number;
    plant_protein: number;
    vegetables: number;
    fruits: number;
  };
  varietyScore: {
    score: number;
    level: string;
    explanation: string;
    categoryCount: number;
    newFoodsThisWeek: number;
  };
  aiInsight: {
    summary: string;
    strengths: string[];
    improvements: string[];
    suggested_foods: string[];
  } | null;
  disclaimer: string;
  _meta?: InsightMeta;
}

/** Section 2: Nutrition Balance */
export interface NutritionBalanceData {
  categories: {
    name: string;
    emoji: string;
    count: number;
    percentage: number;
    status: "deficient" | "adequate" | "excellent";
  }[];
  overallBalance: "poor" | "fair" | "good" | "excellent";
  aiInsight: {
    summary: string;
    strengths: string[];
    improvements: string[];
    suggested_foods: string[];
  } | null;
  ageStage: string;
  disclaimer: string;
  _meta?: InsightMeta;
}

/** Section 3: Next Foods To Try */
export interface NextFoodsData {
  recommendations: {
    name: string;
    category: string;
    categoryLabel: string;
    reason: string;
    score: number;
    ageAppropriate: boolean;
  }[];
  reason: string;
  disclaimer: string;
}

/** Section 4: Recipe Suggestions */
export interface RecipeSuggestionsData {
  recipes: {
    name: string;
    ageRange: string;
    texture: string;
    prepTime: string;
    ingredients: { name: string; amount: string; category: string }[];
    steps: string[];
    nutritionHighlights: string[];
    tips: string[];
  }[];
  disclaimer: string;
  _meta?: InsightMeta;
}

/** Section 5: Taste Profile */
export interface TasteProfileData {
  profile: {
    categoryAffinities: {
      category: string;
      label: string;
      emoji: string;
      score: number;
      totalExposures: number;
      likedCount: number;
      dislikedCount: number;
    }[];
    overallOpenness: number;
    preferredTextures: string[];
    strongLikes: string[];
    strongDislikes: string[];
  } | null;
  disclaimer: string;
}

// ═══════════════════════════════════════════════════════
// DEPRECATED — kept for backward compatibility during migration
// These types are no longer used by the new dashboard.
// ═══════════════════════════════════════════════════════

/** @deprecated Use NextFoodsData */
export interface RecommendationData {
  recommendations: {
    name: string;
    category: string;
    reason: string;
  }[];
  disclaimer: string;
}

/** @deprecated Removed from UI */
export interface PickyEaterData {
  riskLevel: "low" | "moderate" | "high";
  score: number;
  factors: string[];
  suggestions: string[];
  aiInsight?: string;
}

/** @deprecated Removed from UI */
export interface AllergyRiskData {
  hasRisks: boolean;
  allergyFoods: string[];
  patterns: string[];
  recommendations: string[];
  relatedFoods: string[];
  aiInsight?: string;
}

/** @deprecated Removed from UI */
export interface AdvancedInsightsData {
  pickyEater: PickyEaterData | null;
  allergyRisk: AllergyRiskData | null;
  nutrition: NutritionBalanceData | null;
  disclaimer: string;
}

/** @deprecated Removed from UI */
export interface MealPlanData {
  week: {
    day: string;
    meals: {
      type: string;
      suggestion: string;
      ingredients: string[];
      category: string;
    }[];
  }[];
  babyAge: string;
  foodStage: string;
  disclaimer: string;
}

/** @deprecated Removed from UI */
export interface FoodPredictionData {
  predictions: {
    ingredientName: string;
    category: string;
    categoryLabel: string;
    acceptanceProbability: number;
    confidence: "low" | "medium" | "high";
    reasoning: string[];
    similarLikedFoods: string[];
  }[];
  disclaimer: string;
}

/** @deprecated Removed from UI */
export interface PersonalizedPlanData {
  plan: {
    babyAge: string;
    foodStage: string;
    tasteOpenness: number;
    nutritionFocus: string[];
    todaysMeals: {
      mealType: string;
      name: string;
      ingredients: { name: string; category: string; reason: string }[];
      texture: string;
      preparationTip: string;
    }[];
    personalInsights: string[];
  } | null;
  disclaimer: string;
}

/** @deprecated Use RecipeSuggestionsData */
export interface RecipeData {
  recipes: {
    name: string;
    ageRange: string;
    texture: string;
    prepTime: string;
    ingredients: { name: string; amount: string; category: string }[];
    steps: string[];
    nutritionHighlights: string[];
    tips: string[];
  }[];
  disclaimer: string;
}

/** @deprecated Removed from UI */
export interface TimelineData {
  timeline: {
    weekLabel: string;
    weekStart: string;
    weekEnd: string;
    foods: {
      name: string;
      category: string;
      firstDate: string;
      hadReaction: boolean;
      liked: boolean | null;
    }[];
  }[];
  disclaimer: string;
}

/** @deprecated Removed from UI */
export interface FeedbackLoopData {
  preferenceProfile: unknown;
  explorationScore: unknown;
  varietyBooster: unknown;
  foodDiscovery: unknown;
  preferenceTimeline: unknown;
  parentInsights: unknown;
  disclaimer: string;
}

/** @deprecated Use NextFoodsData */
export interface NextFoodData {
  recommendedFoods: string[];
  recommendations: {
    name: string;
    category: string;
    reason: string;
    ageAppropriate?: boolean;
    confidenceScore?: number;
  }[];
  reason: string;
  disclaimer: string;
}

/** @deprecated Merged into NutritionBalanceData */
export interface NutritionInsightData {
  summary: string;
  nutritionScore: number;
  suggestions: string[];
  nutrition: NutritionBalanceData | null;
  disclaimer: string;
}

/** @deprecated Merged into RecipeSuggestionsData */
export interface RecipeLibraryData {
  recipes: {
    name: string;
    ageRange: string;
    texture: string;
    prepTime: string;
    ingredients: string[];
    ingredientDetails: { name: string; amount: string; category: string }[];
    instructions: string[];
    steps: string[];
    nutritionHighlights: string[];
    tips: string[];
  }[];
  disclaimer: string;
}

/** @deprecated Kept internally only */
export interface SimilarFoodsData {
  similarFoods: {
    name: string;
    category: string;
    categoryLabel: string;
    similarity: number;
    basedOn: string;
    reason: string;
  }[];
  totalEmbeddings: number;
  basedOnLikedCount: number;
  disclaimer: string;
}
