import { BabyFoodContext } from "@/lib/ai/rag";
import { generateAIResponse } from "@/services/aiServices";
import { BABY_AI_SYSTEM_PROMPT } from "@/lib/prompts";
import { getBabyAgeInMonths, isReadyForSolids, UNDER_6_MONTHS_MESSAGE } from "@/lib/babyAge";
import { buildAgeContext } from "@/lib/ageStages";

export async function generateContextualResponse(
  message: string,
  context: BabyFoodContext | null,
  babyId?: number,
  babyBirthDate?: Date | null
): Promise<string> {
  // Safety guard: under 6 months
  if (babyBirthDate && !isReadyForSolids(babyBirthDate)) {
    return buildUnderSixResponse(message, context, babyBirthDate);
  }

  // Build rich context from baby's food data
  let contextBlock = "";

  if (context) {
    const ageMonths = babyBirthDate
      ? getBabyAgeInMonths(babyBirthDate)
      : context.babyAgeMonths;

    const ageInfo = ageMonths != null ? buildAgeContext(ageMonths) : "";

    const likedFoods = context.likedFoods.slice(0, 12);
    const dislikedFoods = context.dislikedFoods.slice(0, 10);
    const allergyFoods = context.allergyFoods.slice(0, 10);
    const triedPreview = context.triedFoods.slice(0, 12);
    const allowedSeasonings = context.allowedSeasonings.slice(0, 15);
    const restrictedSeasonings = context.restrictedSeasonings.slice(0, 15);
    const recentMealsPreview = context.recentMeals
      .slice(0, 3)
      .map((meal) => {
        const ingredients = meal.ingredients.slice(0, 3).join("+");
        const reaction = meal.liked === true ? "like" : meal.liked === false ? "dislike" : "neutral";
        const allergy = meal.allergy ? " allergy" : "";
        return `${ingredients} [${reaction}${allergy}]`;
      })
      .join("; ");

    contextBlock = `
BABY FOOD CONTEXT:
- Baby name: ${context.babyName}
${ageInfo ? `- ${ageInfo}` : ""}
- Liked foods: ${likedFoods.join(", ") || "None yet"}
- Disliked foods: ${dislikedFoods.join(", ") || "None yet"}
- Allergy foods: ${allergyFoods.join(", ") || "None"}
- Total foods tried: ${context.triedFoods.length} (${triedPreview.join(", ") || "None"})
- Food categories tried: Carbs(${context.foodCategories.carbohydrate}), Animal Protein(${context.foodCategories.proteinAnimal}), Plant Protein(${context.foodCategories.proteinPlant}), Vegetables(${context.foodCategories.vegetables}), Fruits(${context.foodCategories.fruits})
- Allowed seasonings: ${allowedSeasonings.join(", ") || "None yet"}
- Restricted seasonings (age-limited): ${restrictedSeasonings.join(", ") || "None"}
- Recent meals: ${recentMealsPreview || "None"}
`;
  }

  const prompt = contextBlock
    ? `${contextBlock}\nParent's question: ${message}`
    : `Parent's question (no baby data available yet): ${message}`;

  return generateAIResponse(prompt, BABY_AI_SYSTEM_PROMPT);
}

function buildUnderSixResponse(
  message: string,
  context: BabyFoodContext | null,
  babyBirthDate: Date
): string {
  const ageMonths = Math.max(0, getBabyAgeInMonths(babyBirthDate));
  const babyName = context?.babyName || "Bayi Anda";
  const lower = message.toLowerCase();

  if (/(usia|umur|age)/.test(lower)) {
    return `${babyName} saat ini sekitar ${ageMonths} bulan. ${UNDER_6_MONTHS_MESSAGE}`;
  }

  if (/(alerg|allerg)/.test(lower)) {
    const knownAllergies = context?.allergyFoods ?? [];
    if (knownAllergies.length > 0) {
      return `${babyName} punya riwayat reaksi pada: ${knownAllergies.join(", ")}. Karena usia masih ${ageMonths} bulan, konsultasikan ke dokter anak sebelum pengenalan makanan baru.`;
    }
    return `${babyName} belum ada data alergi makanan yang jelas di catatan. Karena usia masih ${ageMonths} bulan, fokus utama tetap ASI/susu formula dan konsultasi dokter anak sebelum MPASI.`;
  }

  if (/(makanan|menu|mpasi|food|recipe|resep)/.test(lower)) {
    return `${UNDER_6_MONTHS_MESSAGE} Saat ini fokus utama adalah ASI/susu formula. Jika ingin persiapan MPASI, saya bisa bantu buat checklist mulai MPASI untuk usia 6 bulan.`;
  }

  return `${babyName} saat ini sekitar ${ageMonths} bulan. ${UNDER_6_MONTHS_MESSAGE} Kalau mau, saya bisa bantu jawab hal persiapan MPASI usia 6 bulan.`;
}
