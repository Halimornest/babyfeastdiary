"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useBaby } from "@/app/components/BabyContext";
import { fetchFoodBuilderData, saveMealLog } from "@/app/services/foodLogService";
import type { IngredientCategory, IngredientItem, DataItem, SeasoningItem } from "@/app/types/food";

export function useFoodBuilder() {
  const searchParams = useSearchParams();
  const { activeBabyId } = useBaby();
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | IngredientCategory>("ALL");
  const [cookingMethods, setCookingMethods] = useState<DataItem[]>([]);
  const [seasonings, setSeasonings] = useState<SeasoningItem[]>([]);
  const [broths, setBroths] = useState<DataItem[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [selectedCookingMethod, setSelectedCookingMethod] = useState<number | null>(null);
  const [selectedSeasonings, setSelectedSeasonings] = useState<number[]>([]);
  const [selectedBroth, setSelectedBroth] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBabyId, setSelectedBabyId] = useState<number | null>(null);

  // Track previous counts for badge animations
  const prevIngCount = useRef(0);
  const prevSeaCount = useRef(0);
  const [ingBadgeAnim, setIngBadgeAnim] = useState(false);
  const [seaBadgeAnim, setSeaBadgeAnim] = useState(false);

  useEffect(() => {
    if (selectedIngredients.length !== prevIngCount.current) {
      setIngBadgeAnim(true);
      const t = setTimeout(() => setIngBadgeAnim(false), 300);
      prevIngCount.current = selectedIngredients.length;
      return () => clearTimeout(t);
    }
  }, [selectedIngredients.length]);

  useEffect(() => {
    if (selectedSeasonings.length !== prevSeaCount.current) {
      setSeaBadgeAnim(true);
      const t = setTimeout(() => setSeaBadgeAnim(false), 300);
      prevSeaCount.current = selectedSeasonings.length;
      return () => clearTimeout(t);
    }
  }, [selectedSeasonings.length]);

  // Sync with BabyContext when active baby changes
  useEffect(() => {
    if (activeBabyId) setSelectedBabyId(activeBabyId);
  }, [activeBabyId]);

  useEffect(() => {
    fetchFoodBuilderData()
      .then(({ ingredients: ingredientsData, cookingMethods: cookingData, seasonings: seasoningsData, broths: brothsData, babies: babiesData }) => {
        setIngredients(ingredientsData);
        setCookingMethods(cookingData);
        setSeasonings(seasoningsData);
        setBroths(brothsData);

        // Resolve the active baby ID: prefer query param, then localStorage, then first baby
        const babyIdFromQuery = Number(searchParams.get("babyId"));
        const babyIdFromStorage = Number(localStorage.getItem("selectedBabyId"));
        const preferredId =
          (Number.isInteger(babyIdFromQuery) && babyIdFromQuery > 0 ? babyIdFromQuery : null) ??
          (Number.isInteger(babyIdFromStorage) && babyIdFromStorage > 0 ? babyIdFromStorage : null);

        const validBaby = preferredId
          ? babiesData.find((b: DataItem) => b.id === preferredId)
          : null;

        const resolvedId = validBaby ? preferredId! : babiesData[0]?.id ?? null;
        setSelectedBabyId(resolvedId);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to load food builder data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const vibrate = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      const matchCategory = activeCategory === "ALL" || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(ingredientSearch.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [ingredients, activeCategory, ingredientSearch]);

  const groupedIngredients = useMemo(() => {
    if (activeCategory !== "ALL") return null;
    const groups: Partial<Record<IngredientCategory, IngredientItem[]>> = {};
    for (const item of filteredIngredients) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    }
    return groups;
  }, [filteredIngredients, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: ingredients.length };
    for (const item of ingredients) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [ingredients]);

  const toggleIngredient = useCallback((id: number) => {
    vibrate();
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, [vibrate]);

  const toggleSeasoning = useCallback((id: number) => {
    vibrate();
    setSelectedSeasonings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, [vibrate]);

  const handleSubmit = useCallback(async () => {
    if (selectedIngredients.length === 0) return;
    if (!selectedBabyId) {
      setError("No baby profile found. Please add a baby first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMealLog({
        babyId: selectedBabyId,
        ingredientIds: selectedIngredients,
        seasoningIds: selectedSeasonings,
        cookingMethodId: selectedCookingMethod,
        brothId: selectedBroth,
        note: note || undefined,
      });

      setShowSuccess(true);
      setSelectedIngredients([]);
      setSelectedCookingMethod(null);
      setSelectedSeasonings([]);
      setSelectedBroth(null);
      setNote("");
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Failed to save:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIngredients, selectedBabyId, selectedSeasonings, selectedCookingMethod, selectedBroth, note]);

  return {
    // Data
    ingredients,
    cookingMethods,
    seasonings,
    broths,
    // Filter & grouping
    ingredientSearch,
    setIngredientSearch,
    activeCategory,
    setActiveCategory,
    filteredIngredients,
    groupedIngredients,
    categoryCounts,
    // Selection
    selectedIngredients,
    selectedCookingMethod,
    setSelectedCookingMethod,
    selectedSeasonings,
    selectedBroth,
    setSelectedBroth,
    note,
    setNote,
    // Handlers
    toggleIngredient,
    toggleSeasoning,
    handleSubmit,
    // UI state
    error,
    isSubmitting,
    showSuccess,
    loading,
    ingBadgeAnim,
    seaBadgeAnim,
  };
}
