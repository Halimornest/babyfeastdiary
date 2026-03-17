import type { IngredientCategory } from "@/app/types/food";

/** Emoji map for ingredient names — used across FoodBuilder, Summary, and History pages */
export const ingredientEmojis: Record<string, string> = {
  // Karbohidrat
  "Nasi putih": "🍚",
  "Beras merah": "🍚",
  "Beras hitam": "🍚",
  Oat: "🥣",
  Kentang: "🥔",
  "Ubi jalar": "🍠",
  "Ubi ungu": "🍠",
  Singkong: "🥔",
  Jagung: "🌽",
  Sagu: "🫓",
  Quinoa: "🌾",
  Pasta: "🍝",
  "Mie telur": "🍜",
  Barley: "🌾",
  Couscous: "🫘",

  // Protein Hewani
  Ayam: "🍗",
  "Daging sapi": "🥩",
  "Daging kambing": "🥩",
  "Daging bebek": "🦆",
  "Telur ayam": "🥚",
  "Telur puyuh": "🥚",
  "Ikan salmon": "🐟",
  "Ikan tuna": "🐟",
  "Ikan kembung": "🐟",
  "Ikan tenggiri": "🐟",
  "Ikan kakap": "🐟",
  "Ikan nila": "🐟",
  "Ikan gurame": "🐟",
  "Ikan sarden": "🐟",
  "Ikan lele": "🐟",
  Udang: "🦐",
  Cumi: "🦑",
  Kerang: "🦪",
  "Hati ayam": "🫀",
  "Hati sapi": "🫀",

  // Protein Nabati
  Tahu: "🧈",
  Tempe: "🫘",
  "Kacang merah": "🫘",
  "Kacang hijau": "🫛",
  "Kacang hitam": "🫘",
  "Kacang kedelai": "🫘",
  Edamame: "🫛",
  Chickpeas: "🫘",
  "Lentil merah": "🫘",
  "Lentil hijau": "🫘",
  "Kacang polong": "🫛",
  Almond: "🌰",
  Walnut: "🌰",
  "Chia seed": "🌱",
  Flaxseed: "🌱",

  // Sayuran
  Wortel: "🥕",
  Brokoli: "🥦",
  "Kembang kol": "🥦",
  Bayam: "🥬",
  Kangkung: "🥬",
  Pakcoy: "🥬",
  "Sawi hijau": "🥬",
  "Labu kuning": "🎃",
  Zucchini: "🥒",
  Terong: "🍆",
  Buncis: "🫛",
  "Kacang panjang": "🫛",
  "Jagung manis": "🌽",
  Tomat: "🍅",
  Mentimun: "🥒",
  "Paprika merah": "🌶️",
  "Paprika kuning": "🌶️",
  "Paprika hijau": "🫑",
  "Jamur kancing": "🍄",
  "Jamur shiitake": "🍄",
  "Jamur tiram": "🍄",
  "Daun katuk": "🌿",
  "Daun kelor": "🌿",
  Selada: "🥬",
  Lobak: "🥕",

  // Buah
  Pisang: "🍌",
  Alpukat: "🥑",
  Apel: "🍎",
  Pir: "🍐",
  Mangga: "🥭",
  Pepaya: "🍈",
  Semangka: "🍉",
  Melon: "🍈",
  Kiwi: "🥝",
  Stroberi: "🍓",
  Blueberry: "🫐",
  Raspberry: "🫐",
  "Jeruk manis": "🍊",
  "Jeruk mandarin": "🍊",
  Anggur: "🍇",
  "Naga merah": "🐉",
  "Naga putih": "🐉",
  Sirsak: "🍈",
  "Jambu biji": "🍈",
  "Jambu air": "🍈",
  Plum: "🍑",
  Persik: "🍑",
  Aprikot: "🍑",
  Kurma: "🌴",
  Delima: "🫐",

  // Short aliases used only in summary (kept for backward compatibility)
  Telur: "🥚",
  Ikan: "🐟",
  Ubi: "🍠",
  Labu: "🎃",
};

export const cookingEmojis: Record<string, string> = {
  Rebus: "♨️",
  Kukus: "💨",
  Tumis: "🍳",
  Panggang: "🔥",
  Puree: "🥣",
};

export const seasoningEmojis: Record<string, string> = {
  // Aromatic
  "Bawang merah": "🧅",
  "Bawang putih": "🧄",
  "Bawang bombay": "🧅",
  "Daun bawang": "🌿",
  "Daun seledri": "🌿",
  "Daun pandan": "🌿",

  // Spices
  Jahe: "🫚",
  Kunyit: "✨",
  "Kayu manis": "🪵",
  Pala: "🌰",
  "Lada hitam": "🌶",
  "Lada putih": "🌶",
  Merica: "🌶",

  // Herbs
  Parsley: "🌿",
  Basil: "🌿",
  Oregano: "🌿",
  Thyme: "🌿",
  Mint: "🌿",
  Vanilla: "🌼",

  // Savory
  Tomat: "🍅",
  Jamur: "🍄",
  "Kaldu ayam": "🍲",
  "Kaldu sapi": "🍲",
  "Kaldu ikan": "🍲",

  // Fats
  "Olive oil": "🫒",
  "Minyak alpukat": "🥑",
  Santan: "🥥",
  "Unsalted butter": "🧈",
  Keju: "🧀",

  // Acids
  "Air lemon": "🍋",
  "Air jeruk nipis": "🍋",
};

export const categoryEmojis: Record<string, string> = {
  carbohydrates: "🍚",
  animal_protein: "🥩",
  plant_protein: "🫘",
  vegetables: "🥬",
  fruits: "🍎",
};

export const categoryLabels: Record<string, string> = {
  carbohydrates: "Carbs",
  animal_protein: "Animal Protein",
  plant_protein: "Plant Protein",
  vegetables: "Vegetables",
  fruits: "Fruits",
};

export const CATEGORIES: { key: "ALL" | IngredientCategory; label: string; emoji: string }[] = [
  { key: "ALL", label: "Semua", emoji: "🍽️" },
  { key: "KARBO", label: "Karbohidrat", emoji: "🥔" },
  { key: "PROTEIN_HEWANI", label: "Protein Hewani", emoji: "🍗" },
  { key: "PROTEIN_NABATI", label: "Protein Nabati", emoji: "🌱" },
  { key: "SAYURAN", label: "Sayuran", emoji: "🥕" },
  { key: "BUAH", label: "Buah", emoji: "🍎" },
];

export const CATEGORY_META: Record<IngredientCategory, { label: string; emoji: string }> = {
  KARBO: { label: "Karbohidrat", emoji: "🥔" },
  PROTEIN_HEWANI: { label: "Protein Hewani", emoji: "🍗" },
  PROTEIN_NABATI: { label: "Protein Nabati", emoji: "🌱" },
  SAYURAN: { label: "Sayuran", emoji: "🥕" },
  BUAH: { label: "Buah", emoji: "🍎" },
};
