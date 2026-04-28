"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import BottomNav from "../../components/BottomNav";
import BabySwitcher from "../../components/BabySwitcher";
import { useBaby } from "../../components/BabyContext";
import type { FoodLog } from "@/app/types/history";
import type { DataItem, IngredientCategory, IngredientItem, SeasoningCategory, SeasoningItem } from "@/app/types/food";
import { ingredientEmojis, cookingEmojis, seasoningEmojis, CATEGORIES } from "@/app/constants/emojis";
import { formatRelativeDate as formatDate } from "@/app/utils/date";
import { fetchWithTimeoutAndRetry } from "@/lib/fetch-with-retry";

const FAT_ITEM_NAMES = new Set([
  "olive oil",
  "beef oil",
  "chicken oil",
  "unsalted butter",
  "vegetable oil",
]);

const SEASONING_CATEGORIES: { key: "ALL" | Exclude<SeasoningCategory, "FAT">; label: string; emoji: string }[] = [
  { key: "ALL", label: "Semua", emoji: "🧂" },
  { key: "AROMATIC", label: "Aromatic", emoji: "🧄" },
  { key: "HERB", label: "Herb", emoji: "🌿" },
  { key: "SPICE", label: "Spice", emoji: "🌶️" },
];

export default function HistoryPage() {
  const { activeBabyId } = useBaby();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [prefetched, setPrefetched] = useState<{ cursor: number | null; items: FoodLog[]; nextCursor: number | null } | null>(null);
  const [savingReaction, setSavingReaction] = useState<number | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);
  const [confirmDeleteLogId, setConfirmDeleteLogId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [ingredientOptions, setIngredientOptions] = useState<IngredientItem[]>([]);
  const [seasoningOptions, setSeasoningOptions] = useState<SeasoningItem[]>([]);
  const [cookingMethodOptions, setCookingMethodOptions] = useState<DataItem[]>([]);
  const [brothOptions, setBrothOptions] = useState<DataItem[]>([]);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editingIngredientIds, setEditingIngredientIds] = useState<number[]>([]);
  const [editingSeasoningIds, setEditingSeasoningIds] = useState<number[]>([]);
  const [editingCookingMethodId, setEditingCookingMethodId] = useState<number | null>(null);
  const [editingBrothId, setEditingBrothId] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSearch, setEditSearch] = useState("");
  const [editCategory, setEditCategory] = useState<"ALL" | IngredientCategory>("ALL");
  const [editSeasoningSearch, setEditSeasoningSearch] = useState("");
  const [editSeasoningCategory, setEditSeasoningCategory] = useState<"ALL" | Exclude<SeasoningCategory, "FAT">>("ALL");
  const [editFatSearch, setEditFatSearch] = useState("");
  const [editTab, setEditTab] = useState<"ingredients" | "seasonings" | "details">("ingredients");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchHistoryPage = useCallback(
    async (cursor: number | null) => {
      if (!activeBabyId) {
        return { items: [] as FoodLog[], nextCursor: null as number | null };
      }
      const cursorQuery = cursor ? `&cursor=${cursor}` : "";
      const res = await fetchWithTimeoutAndRetry(
        `/api/food-log?babyId=${activeBabyId}&limit=30&paged=1${cursorQuery}`,
        {},
        { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }
      );
      const data = (await res.json()) as {
        items?: FoodLog[];
        nextCursor?: number | null;
      };
      return {
        items: Array.isArray(data.items) ? data.items : [],
        nextCursor: typeof data.nextCursor === "number" ? data.nextCursor : null,
      };
    },
    [activeBabyId]
  );

  const loadHistory = useCallback(
    async (reset: boolean) => {
      if (!activeBabyId) return;
      const currentCursor = reset ? null : nextCursor;
      if (!reset && (!hasMore || loadingMore)) return;

      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const fromPrefetch =
          !reset &&
          prefetched &&
          prefetched.cursor === currentCursor;

        const page = fromPrefetch
          ? { items: prefetched.items, nextCursor: prefetched.nextCursor }
          : await fetchHistoryPage(currentCursor);

        const items = page.items;
        setFoodLogs((prev) => (reset ? items : [...prev, ...items]));
        setNextCursor(page.nextCursor);
        setHasMore(Boolean(page.nextCursor));
        setPrefetched(null);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (reset) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [activeBabyId, hasMore, loadingMore, nextCursor, fetchHistoryPage, prefetched]
  );

  useEffect(() => {
    setFoodLogs([]);
    setNextCursor(null);
    setHasMore(true);
    setPrefetched(null);
    if (!activeBabyId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const page = await fetchHistoryPage(null);
        if (cancelled) return;
        setFoodLogs(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(Boolean(page.nextCursor));
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load history:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeBabyId, fetchHistoryPage]);

  useEffect(() => {
    if (!activeBabyId || loading || loadingMore || !hasMore || !nextCursor) return;
    if (prefetched?.cursor === nextCursor) return;

    const idle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as Window & {
            requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
            cancelIdleCallback: (id: number) => void;
          })
        : null;

    let cancelled = false;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const runPrefetch = async () => {
      try {
        const page = await fetchHistoryPage(nextCursor);
        if (cancelled) return;
        setPrefetched({ cursor: nextCursor, items: page.items, nextCursor: page.nextCursor });
      } catch {
        // silent prefetch failure
      }
    };

    if (idle) {
      idleId = idle.requestIdleCallback(() => {
        void runPrefetch();
      }, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(() => {
        void runPrefetch();
      }, 350);
    }

    return () => {
      cancelled = true;
      if (idle && idleId !== null) idle.cancelIdleCallback(idleId);
      if (!idle && timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [activeBabyId, loading, loadingMore, hasMore, nextCursor, fetchHistoryPage, prefetched]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadHistory(false);
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadHistory]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [ingRes, seaRes, cookRes, brothRes] = await Promise.all([
          fetchWithTimeoutAndRetry("/api/ingredients", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
          fetchWithTimeoutAndRetry("/api/seasonings", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
          fetchWithTimeoutAndRetry("/api/cooking-methods", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
          fetchWithTimeoutAndRetry("/api/broths", {}, { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }),
        ]);

        if (!ingRes.ok || !seaRes.ok || !cookRes.ok || !brothRes.ok) return;

        const [ingData, seaData, cookData, brothData] = await Promise.all([
          ingRes.json() as Promise<IngredientItem[]>,
          seaRes.json() as Promise<SeasoningItem[]>,
          cookRes.json() as Promise<DataItem[]>,
          brothRes.json() as Promise<DataItem[]>,
        ]);

        if (!cancelled) {
          if (Array.isArray(ingData)) setIngredientOptions(ingData);
          if (Array.isArray(seaData)) setSeasoningOptions(seaData);
          if (Array.isArray(cookData)) setCookingMethodOptions(cookData);
          if (Array.isArray(brothData)) setBrothOptions(brothData);
        }
      } catch {
        // silent
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReaction = async (
    logId: number,
    type: "liked" | "disliked" | "allergy"
  ) => {
    setSavingReaction(logId);
    try {
      const res = await fetchWithTimeoutAndRetry(
        "/api/reaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            foodLogId: logId,
            liked: type === "liked" ? true : type === "disliked" ? false : null,
            allergy: type === "allergy" ? true : false,
          }),
        },
        { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }
      );

      if (res.ok) {
        const reaction = await res.json();
        setFoodLogs((prev) =>
          prev.map((log) => (log.id === logId ? { ...log, reaction } : log))
        );
      }
    } catch (err) {
      console.error("Failed to save reaction:", err);
    } finally {
      setSavingReaction(null);
    }
  };

  const handleDelete = async (logId: number) => {
    setDeleteError(null);
    setDeletingLogId(logId);
    try {
      const res = await fetchWithTimeoutAndRetry(
        `/api/food-log/${logId}`,
        { method: "DELETE" },
        { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(
          data && typeof data.error === "string"
            ? data.error
            : "Gagal menghapus meal history"
        );
        return;
      }
      setFoodLogs((prev) => prev.filter((log) => log.id !== logId));
      setConfirmDeleteLogId(null);
    } catch (err) {
      console.error("Failed to delete food log:", err);
      setDeleteError("Gagal menghapus meal history");
    } finally {
      setDeletingLogId(null);
    }
  };

  const openEditIngredients = (log: FoodLog) => {
    setEditingLogId(log.id);
    setEditingIngredientIds(log.ingredients.map((item) => item.ingredient.id));
    setEditingSeasoningIds(log.seasonings.map((item) => item.seasoning.id));
    setEditingCookingMethodId(log.cookingMethod?.id ?? null);
    setEditingBrothId(log.broth?.id ?? null);
    setEditingNote(log.note ?? "");
    setEditError(null);
    setEditSearch("");
    setEditCategory("ALL");
    setEditSeasoningSearch("");
    setEditSeasoningCategory("ALL");
    setEditFatSearch("");
    setEditTab("ingredients");
  };

  const editIngredientOptions = useMemo(() => {
    return ingredientOptions.filter((item) => {
      const matchCategory = editCategory === "ALL" || item.category === editCategory;
      const matchSearch = item.name.toLowerCase().includes(editSearch.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [ingredientOptions, editCategory, editSearch]);

  const editCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: ingredientOptions.length };
    for (const item of ingredientOptions) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [ingredientOptions]);

  const editSeasoningOptions = useMemo(() => {
    return seasoningOptions.filter((item) => {
      const itemCategory = item.category ?? "AROMATIC";
      if (itemCategory === "FAT") return false;
      const matchCategory = editSeasoningCategory === "ALL" || itemCategory === editSeasoningCategory;
      const matchSearch = item.name.toLowerCase().includes(editSeasoningSearch.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [seasoningOptions, editSeasoningCategory, editSeasoningSearch]);

  const editSeasoningCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    for (const item of seasoningOptions) {
      const key = item.category ?? "AROMATIC";
      if (key === "FAT") continue;
      counts.ALL += 1;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [seasoningOptions]);

  const editFatOptions = useMemo(() => {
    return seasoningOptions.filter((item) => {
      const isFat = (item.category ?? "AROMATIC") === "FAT";
      const isNamedFat = FAT_ITEM_NAMES.has(item.name.toLowerCase());
      const matchSearch = item.name.toLowerCase().includes(editFatSearch.toLowerCase());
      return isFat && isNamedFat && matchSearch;
    });
  }, [seasoningOptions, editFatSearch]);

  const toggleEditIngredient = (ingredientId: number) => {
    setEditingIngredientIds((prev) =>
      prev.includes(ingredientId)
        ? prev.filter((id) => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const toggleEditSeasoning = (seasoningId: number) => {
    setEditingSeasoningIds((prev) =>
      prev.includes(seasoningId)
        ? prev.filter((id) => id !== seasoningId)
        : [...prev, seasoningId]
    );
  };

  const handleSaveIngredients = async () => {
    if (!editingLogId) return;
    if (editingIngredientIds.length === 0) {
      setEditError("Pilih minimal 1 ingredient.");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetchWithTimeoutAndRetry(
        `/api/food-log/${editingLogId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredientIds: editingIngredientIds,
            seasoningIds: editingSeasoningIds,
            cookingMethodId: editingCookingMethodId,
            brothId: editingBrothId,
            note: editingNote.trim() ? editingNote.trim() : null,
          }),
        },
        { timeoutMs: 12000, retries: 1, retryDelayMs: 250 }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setEditError(
          data && typeof data.error === "string"
            ? data.error
            : "Gagal update ingredient meal"
        );
        return;
      }

      setFoodLogs((prev) =>
        prev.map((log) => (log.id === editingLogId ? (data as FoodLog) : log))
      );
      setEditingLogId(null);
      setEditingIngredientIds([]);
      setEditingSeasoningIds([]);
      setEditingCookingMethodId(null);
      setEditingBrothId(null);
      setEditingNote("");
      setEditSeasoningSearch("");
      setEditFatSearch("");
    } catch (err) {
      console.error("Failed to edit ingredients:", err);
      setEditError("Gagal update ingredient meal");
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-peach-100 rounded-2xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="w-28 h-4 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-44 h-3 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
                ))}
              </div>
              <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-4 w-full bg-gray-50 rounded-full animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-peach-100 rounded-2xl flex items-center justify-center text-xl shrink-0">
            📋
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Meal History
            </h1>
            <p className="text-xs text-gray-400">
              See what your baby has eaten
            </p>
          </div>
          <BabySwitcher />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {foodLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center animate-section-enter">
            <span className="text-4xl block mb-3">🍽️</span>
            <p className="text-gray-500 font-medium">No meals logged yet</p>
            <p className="text-gray-400 text-sm mt-1">Start by adding your baby&apos;s first meal!</p>
          </div>
        ) : (
          foodLogs.map((log, index) => (
            <article
              key={log.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-section-enter hover:shadow-md transition-shadow duration-300"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
            >
              {/* Timestamp */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">
                  {formatDate(log.date)}
                </span>
                <div className="flex items-center gap-2">
                  {log.cookingMethod && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-mint-700 bg-mint-50 px-2.5 py-1 rounded-full">
                      {cookingEmojis[log.cookingMethod.name] || "🍳"}{" "}
                      {log.cookingMethod.name}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditIngredients(log)}
                    disabled={deletingLogId === log.id}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmDeleteLogId(log.id);
                    }}
                    disabled={deletingLogId === log.id}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {deletingLogId === log.id ? "Menghapus..." : "🗑️ Hapus"}
                  </button>
                </div>
              </div>

              {/* Ingredients */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {log.ingredients.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-peach-50 text-peach-800 border border-peach-200"
                  >
                    {ingredientEmojis[item.ingredient.name] || "🥘"}{" "}
                    {item.ingredient.name}
                  </span>
                ))}
              </div>

              {/* Seasonings */}
              {log.seasonings.filter((item) => (item.seasoning.category ?? "AROMATIC") !== "FAT").length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {log.seasonings
                    .filter((item) => (item.seasoning.category ?? "AROMATIC") !== "FAT")
                    .map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cream-50 text-gray-600 border border-cream-200"
                    >
                      {seasoningEmojis[item.seasoning.name] || "🧂"}{" "}
                      {item.seasoning.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Fats */}
              {log.seasonings.filter((item) => (item.seasoning.category ?? "AROMATIC") === "FAT").length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {log.seasonings
                    .filter((item) => (item.seasoning.category ?? "AROMATIC") === "FAT")
                    .map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"
                    >
                      {seasoningEmojis[item.seasoning.name] || "🫗"}{" "}
                      {item.seasoning.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Broth */}
              {log.broth && (
                <p className="text-xs text-gray-500 mb-2">
                  🍲 Broth: <span className="font-medium">{log.broth.name}</span>
                </p>
              )}

              {/* Note */}
              {log.note && (
                <p className="text-xs text-gray-400 italic mb-3 bg-gray-50 rounded-xl px-3 py-2">
                  &quot;{log.note}&quot;
                </p>
              )}

              {/* Reaction Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleReaction(log.id, "liked")}
                  disabled={savingReaction === log.id}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
                    transition-all duration-200 cursor-pointer active:scale-95
                    ${
                      log.reaction?.liked === true
                        ? "bg-mint-100 text-mint-700 border-2 border-mint-300 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-mint-50 hover:text-mint-600 hover:border-mint-200"
                    }
                  `}
                >
                  👍 Liked
                </button>
                <button
                  onClick={() => handleReaction(log.id, "disliked")}
                  disabled={savingReaction === log.id}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
                    transition-all duration-200 cursor-pointer active:scale-95
                    ${
                      log.reaction?.liked === false
                        ? "bg-peach-100 text-peach-700 border-2 border-peach-300 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-peach-50 hover:text-peach-600 hover:border-peach-200"
                    }
                  `}
                >
                  👎 Disliked
                </button>
                <button
                  onClick={() => handleReaction(log.id, "allergy")}
                  disabled={savingReaction === log.id}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
                    transition-all duration-200 cursor-pointer active:scale-95
                    ${
                      log.reaction?.allergy === true
                        ? "bg-red-100 text-red-700 border-2 border-red-300 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    }
                  `}
                >
                  ⚠️ Allergy
                </button>
              </div>
            </article>
          ))
        )}

        {foodLogs.length > 0 && (
          <div ref={loadMoreRef} className="py-4">
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-peach-300 border-t-transparent rounded-full animate-spin" />
                <span>Memuat riwayat...</span>
              </div>
            )}
            {!hasMore && !loadingMore && (
              <p className="text-center text-xs text-gray-400">Semua riwayat sudah ditampilkan</p>
            )}
          </div>
        )}
      </main>

      {confirmDeleteLogId !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white shadow-2xl animate-section-enter overflow-hidden">
            <div className="bg-linear-to-r from-red-50 via-white to-peach-50 px-5 pt-5 pb-4 border-b border-red-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-lg shrink-0">
                  🗑️
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Hapus Meal History?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Data ini akan dihapus permanen dan tidak bisa dikembalikan.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              {deleteError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={deletingLogId === confirmDeleteLogId}
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmDeleteLogId(null);
                  }}
                  className="h-11 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deletingLogId === confirmDeleteLogId}
                  onClick={() => void handleDelete(confirmDeleteLogId)}
                  className="h-11 rounded-2xl border border-red-300 bg-red-500 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {deletingLogId === confirmDeleteLogId ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingLogId !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-lg rounded-3xl border border-blue-100 bg-white shadow-2xl animate-section-enter overflow-hidden">
            <div className="bg-linear-to-r from-blue-50 via-white to-peach-50 px-5 pt-5 pb-4 border-b border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0">
                  ✏️
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Edit Ingredients</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update ingredient meal kalau ada yang tertinggal.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              {editError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditTab("ingredients")}
                  className={`h-10 rounded-xl text-xs font-semibold border transition-colors ${
                    editTab === "ingredients"
                      ? "bg-peach-400 text-white border-peach-400"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Ingredients
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab("seasonings")}
                  className={`h-10 rounded-xl text-xs font-semibold border transition-colors ${
                    editTab === "seasonings"
                      ? "bg-peach-400 text-white border-peach-400"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Seasoning & Lemak
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab("details")}
                  className={`h-10 rounded-xl text-xs font-semibold border transition-colors ${
                    editTab === "details"
                      ? "bg-peach-400 text-white border-peach-400"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Detail Meal
                </button>
              </div>

              <div className="max-h-[56vh] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/40 p-3 space-y-3">
                {editTab === "ingredients" && (
                  <>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <input
                        type="text"
                        value={editSearch}
                        onChange={(e) => setEditSearch(e.target.value)}
                        placeholder="Cari ingredient..."
                        className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => {
                        const isActive = editCategory === cat.key;
                        const count = editCategoryCounts[cat.key] || 0;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setEditCategory(cat.key)}
                            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-peach-400 text-white"
                                : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span className="truncate">{cat.label}</span>
                            {count > 0 && <span className="text-[10px]">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="max-h-72 overflow-y-auto rounded-2xl border border-gray-100 p-3 bg-white">
                      {editIngredientOptions.map((item) => {
                        const selected = editingIngredientIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleEditIngredient(item.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl mb-1 border text-sm transition-colors ${
                              selected
                                ? "bg-peach-50 border-peach-300 text-peach-700"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {ingredientEmojis[item.name] || "🥘"} {item.name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {editTab === "seasonings" && (
                  <>
                    <p className="text-sm font-semibold text-gray-700">Seasonings</p>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <input
                        type="text"
                        value={editSeasoningSearch}
                        onChange={(e) => setEditSeasoningSearch(e.target.value)}
                        placeholder="Cari seasoning..."
                        className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {SEASONING_CATEGORIES.map((cat) => {
                        const isActive = editSeasoningCategory === cat.key;
                        const count = editSeasoningCategoryCounts[cat.key] || 0;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setEditSeasoningCategory(cat.key)}
                            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-peach-400 text-white"
                                : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span className="truncate">{cat.label}</span>
                            {count > 0 && <span className="text-[10px]">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto rounded-2xl border border-gray-100 p-2 bg-white">
                      {editSeasoningOptions.map((item) => {
                        const selected = editingSeasoningIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleEditSeasoning(item.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              selected
                                ? "bg-peach-100 text-peach-700 border-peach-300"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {seasoningEmojis[item.name] || "🧂"} {item.name}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-sm font-semibold text-gray-700">Lemak Nabati & Hewani</p>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <input
                        type="text"
                        value={editFatSearch}
                        onChange={(e) => setEditFatSearch(e.target.value)}
                        placeholder="Cari lemak..."
                        className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto rounded-2xl border border-gray-100 p-2 bg-white">
                      {editFatOptions.map((item) => {
                        const selected = editingSeasoningIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleEditSeasoning(item.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              selected
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {seasoningEmojis[item.name] || "🫗"} {item.name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {editTab === "details" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Cooking Method</p>
                      <div className="flex flex-wrap gap-2">
                        {cookingMethodOptions.map((method) => {
                          const selected = editingCookingMethodId === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() =>
                                setEditingCookingMethodId((prev) => (prev === method.id ? null : method.id))
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                selected
                                  ? "bg-mint-100 text-mint-700 border-mint-300"
                                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              {cookingEmojis[method.name] || "🍳"} {method.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Broth</p>
                      <div className="flex flex-wrap gap-2">
                        {brothOptions.map((broth) => {
                          const selected = editingBrothId === broth.id;
                          return (
                            <button
                              key={broth.id}
                              type="button"
                              onClick={() => setEditingBrothId((prev) => (prev === broth.id ? null : broth.id))}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                selected
                                  ? "bg-blue-100 text-blue-700 border-blue-300"
                                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              🍲 {broth.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Notes</p>
                      <textarea
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        rows={4}
                        placeholder="Tambahkan catatan meal..."
                        className="w-full bg-cream-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200 resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={() => {
                    setEditingLogId(null);
                    setEditingIngredientIds([]);
                    setEditingSeasoningIds([]);
                    setEditingCookingMethodId(null);
                    setEditingBrothId(null);
                    setEditingNote("");
                    setEditError(null);
                    setEditSeasoningSearch("");
                    setEditFatSearch("");
                  }}
                  className="h-11 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={editSaving || editingIngredientIds.length === 0}
                  onClick={() => void handleSaveIngredients()}
                  className="h-11 rounded-2xl border border-peach-300 bg-peach-500 text-sm font-semibold text-white hover:bg-peach-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {editSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
