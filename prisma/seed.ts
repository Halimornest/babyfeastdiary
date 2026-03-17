import { PrismaClient } from "../app/generated/prisma";
import { IngredientCategory } from "../app/generated/prisma";
import { SeasoningCategory } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {

  const ingredients = [

    // KARBOHIDRAT
    { name: "Nasi putih", category: IngredientCategory.KARBO },
    { name: "Beras merah", category: IngredientCategory.KARBO },
    { name: "Beras hitam", category: IngredientCategory.KARBO },
    { name: "Oat", category: IngredientCategory.KARBO },
    { name: "Kentang", category: IngredientCategory.KARBO },
    { name: "Ubi jalar", category: IngredientCategory.KARBO },
    { name: "Ubi ungu", category: IngredientCategory.KARBO },
    { name: "Singkong", category: IngredientCategory.KARBO },
    { name: "Jagung", category: IngredientCategory.KARBO },
    { name: "Sagu", category: IngredientCategory.KARBO },
    { name: "Quinoa", category: IngredientCategory.KARBO },
    { name: "Pasta", category: IngredientCategory.KARBO },
    { name: "Mie telur", category: IngredientCategory.KARBO },
    { name: "Barley", category: IngredientCategory.KARBO },
    { name: "Couscous", category: IngredientCategory.KARBO },


    // PROTEIN HEWANI
    { name: "Ayam", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Daging sapi", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Daging kambing", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Daging bebek", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Telur ayam", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Telur puyuh", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan salmon", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan tuna", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan kembung", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan tenggiri", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan kakap", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan nila", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan gurame", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan sarden", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Ikan lele", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Udang", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Cumi", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Kerang", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Hati ayam", category: IngredientCategory.PROTEIN_HEWANI },
    { name: "Hati sapi", category: IngredientCategory.PROTEIN_HEWANI },


    // PROTEIN NABATI
    { name: "Tahu", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Tempe", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Kacang merah", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Kacang hijau", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Kacang hitam", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Kacang kedelai", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Edamame", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Chickpeas", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Lentil merah", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Lentil hijau", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Kacang polong", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Almond", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Walnut", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Chia seed", category: IngredientCategory.PROTEIN_NABATI },
    { name: "Flaxseed", category: IngredientCategory.PROTEIN_NABATI },


    // SAYURAN
    { name: "Wortel", category: IngredientCategory.SAYURAN },
    { name: "Brokoli", category: IngredientCategory.SAYURAN },
    { name: "Kembang kol", category: IngredientCategory.SAYURAN },
    { name: "Bayam", category: IngredientCategory.SAYURAN },
    { name: "Kangkung", category: IngredientCategory.SAYURAN },
    { name: "Pakcoy", category: IngredientCategory.SAYURAN },
    { name: "Sawi hijau", category: IngredientCategory.SAYURAN },
    { name: "Labu kuning", category: IngredientCategory.SAYURAN },
    { name: "Zucchini", category: IngredientCategory.SAYURAN },
    { name: "Terong", category: IngredientCategory.SAYURAN },
    { name: "Buncis", category: IngredientCategory.SAYURAN },
    { name: "Kacang panjang", category: IngredientCategory.SAYURAN },
    { name: "Jagung manis", category: IngredientCategory.SAYURAN },
    { name: "Tomat", category: IngredientCategory.SAYURAN },
    { name: "Mentimun", category: IngredientCategory.SAYURAN },
    { name: "Paprika merah", category: IngredientCategory.SAYURAN },
    { name: "Paprika kuning", category: IngredientCategory.SAYURAN },
    { name: "Paprika hijau", category: IngredientCategory.SAYURAN },
    { name: "Jamur kancing", category: IngredientCategory.SAYURAN },
    { name: "Jamur shiitake", category: IngredientCategory.SAYURAN },
    { name: "Jamur tiram", category: IngredientCategory.SAYURAN },
    { name: "Daun katuk", category: IngredientCategory.SAYURAN },
    { name: "Daun kelor", category: IngredientCategory.SAYURAN },
    { name: "Selada", category: IngredientCategory.SAYURAN },
    { name: "Lobak", category: IngredientCategory.SAYURAN },


    // BUAH
    { name: "Pisang", category: IngredientCategory.BUAH },
    { name: "Alpukat", category: IngredientCategory.BUAH },
    { name: "Apel", category: IngredientCategory.BUAH },
    { name: "Pir", category: IngredientCategory.BUAH },
    { name: "Mangga", category: IngredientCategory.BUAH },
    { name: "Pepaya", category: IngredientCategory.BUAH },
    { name: "Semangka", category: IngredientCategory.BUAH },
    { name: "Melon", category: IngredientCategory.BUAH },
    { name: "Kiwi", category: IngredientCategory.BUAH },
    { name: "Stroberi", category: IngredientCategory.BUAH },
    { name: "Blueberry", category: IngredientCategory.BUAH },
    { name: "Raspberry", category: IngredientCategory.BUAH },
    { name: "Jeruk manis", category: IngredientCategory.BUAH },
    { name: "Jeruk mandarin", category: IngredientCategory.BUAH },
    { name: "Anggur", category: IngredientCategory.BUAH },
    { name: "Naga merah", category: IngredientCategory.BUAH },
    { name: "Naga putih", category: IngredientCategory.BUAH },
    { name: "Sirsak", category: IngredientCategory.BUAH },
    { name: "Jambu biji", category: IngredientCategory.BUAH },
    { name: "Jambu air", category: IngredientCategory.BUAH },
    { name: "Plum", category: IngredientCategory.BUAH },
    { name: "Persik", category: IngredientCategory.BUAH },
    { name: "Aprikot", category: IngredientCategory.BUAH },
    { name: "Kurma", category: IngredientCategory.BUAH },
    { name: "Delima", category: IngredientCategory.BUAH },

  ];

  await prisma.ingredient.createMany({
    data: ingredients,
    skipDuplicates: true,
  });

  console.log("Ingredient seed completed");

  await prisma.cookingMethod.createMany({
    data: [
      { name: "Rebus" },
      { name: "Kukus" },
      { name: "Tumis" },
      { name: "Panggang" },
      { name: "Puree" },
    ],
    skipDuplicates: true,
  });

  const seasoningSeeds = [
    // Aromatic
    { name: "Bawang merah", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Bawang putih", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Daun bawang", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Daun seledri", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Bawang bombay", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Daun pandan", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },

    // Herbs
    { name: "Parsley", category: SeasoningCategory.HERB, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Basil", category: SeasoningCategory.HERB, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Oregano", category: SeasoningCategory.HERB, minAgeMonths: 7, isStrongFlavor: false },
    { name: "Thyme", category: SeasoningCategory.HERB, minAgeMonths: 7, isStrongFlavor: false },
    { name: "Mint", category: SeasoningCategory.HERB, minAgeMonths: 7, isStrongFlavor: false },
    { name: "Vanilla", category: SeasoningCategory.HERB, minAgeMonths: 8, isStrongFlavor: false },

    // Spices
    { name: "Jahe", category: SeasoningCategory.SPICE, minAgeMonths: 8, isStrongFlavor: true },
    { name: "Kunyit", category: SeasoningCategory.SPICE, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Kayu manis", category: SeasoningCategory.SPICE, minAgeMonths: 8, isStrongFlavor: true },
    { name: "Pala", category: SeasoningCategory.SPICE, minAgeMonths: 8, isStrongFlavor: true },
    { name: "Lada putih", category: SeasoningCategory.SPICE, minAgeMonths: 9, isStrongFlavor: true },
    { name: "Lada hitam", category: SeasoningCategory.SPICE, minAgeMonths: 9, isStrongFlavor: true },

    // Savory & acids
    { name: "Tomat", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Jamur", category: SeasoningCategory.AROMATIC, minAgeMonths: 7, isStrongFlavor: false },
    { name: "Kaldu ayam", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Kaldu sapi", category: SeasoningCategory.AROMATIC, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Kaldu ikan", category: SeasoningCategory.AROMATIC, minAgeMonths: 7, isStrongFlavor: false },
    { name: "Air lemon", category: SeasoningCategory.AROMATIC, minAgeMonths: 8, isStrongFlavor: false },
    { name: "Air jeruk nipis", category: SeasoningCategory.AROMATIC, minAgeMonths: 8, isStrongFlavor: false },

    // Healthy fats
    { name: "Olive oil", category: SeasoningCategory.FAT, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Unsalted butter", category: SeasoningCategory.FAT, minAgeMonths: 7, isStrongFlavor: false },
    { name: "Santan", category: SeasoningCategory.FAT, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Minyak alpukat", category: SeasoningCategory.FAT, minAgeMonths: 6, isStrongFlavor: false },
    { name: "Keju", category: SeasoningCategory.FAT, minAgeMonths: 8, isStrongFlavor: false },
  ];

  const uniqueSeasonings = Array.from(
    new Map(seasoningSeeds.map((item) => [item.name.toLowerCase(), item])).values()
  );

  for (const seasoning of uniqueSeasonings) {
    await prisma.seasoning.upsert({
      where: { name: seasoning.name },
      update: {
        category: seasoning.category,
        minAgeMonths: seasoning.minAgeMonths,
        isStrongFlavor: seasoning.isStrongFlavor,
      },
      create: seasoning,
    });
  }

  await prisma.broth.createMany({
    data: [
      { name: "Tanpa kaldu" },
      { name: "Kaldu ayam" },
      { name: "Kaldu sapi" },
      { name: "Kaldu udang" },
      { name: "Kaldu ceker" },
    ],
    skipDuplicates: true,
  });

  // Create a default user and baby if none exist yet
  const babiesCount = await prisma.baby.count();
  if (babiesCount === 0) {
    const user = await prisma.user.upsert({
      where: { email: "parent@babyfeastdiary.dev" },
      update: {},
      create: {
        name: "Orang Tua",
        email: "parent@babyfeastdiary.dev",
        password: "changeme",
      },
    });

    await prisma.baby.create({
      data: {
        name: "Baby",
        birthDate: new Date("2025-01-01"),
        userId: user.id,
      },
    });

    console.log("Default user and baby created");
  }
}

main()
  .then(() => {
    console.log("Seed data inserted");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });