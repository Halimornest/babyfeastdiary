"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBaby, type Baby } from "../../components/BabyContext";
import BottomNav from "../../components/BottomNav";
import { getAge, formatDate } from "@/app/utils/date";

export default function ProfilePage() {
  const { babies, activeBabyId, selectBaby, refreshBabies, loading } =
    useBaby();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  const startEdit = (baby: Baby) => {
    setEditingId(baby.id);
    setEditName(baby.name);
    setEditBirthDate(new Date(baby.birthDate).toISOString().split("T")[0]);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !editBirthDate) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/babies/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), birthDate: editBirthDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }
      await refreshBabies();
      setEditingId(null);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const deleteBaby = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/babies/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
        return;
      }
      setDeleteConfirm(null);
      await refreshBabies();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const addBaby = async () => {
    if (!newName.trim() || !newBirthDate) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/babies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), birthDate: newBirthDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add baby");
        return;
      }
      const created = await res.json();
      await refreshBabies();
      selectBaby(created.id);
      setShowAddForm(false);
      setNewName("");
      setNewBirthDate("");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50 pt-2">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-peach-100 rounded-2xl animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-44 h-3 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
            >
              <div className="w-28 h-5 bg-gray-200 rounded-full animate-pulse mb-3" />
              <div className="w-40 h-4 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ))}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50 pb-24 pt-2">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-peach-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-peach-100 rounded-2xl flex items-center justify-center text-xl shrink-0">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Profile
            </h1>
            <p className="text-xs text-gray-400">
              Manage babies &amp; account
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2 animate-section-enter">
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Baby Cards */}
        {babies.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center animate-section-enter">
            <span className="text-5xl block mb-3">👶</span>
            <p className="text-gray-600 font-semibold text-lg">
              No babies yet
            </p>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              Add your first baby to start tracking their food journey.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-peach-400 to-peach-500 rounded-2xl shadow-md shadow-peach-200/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <span>+</span> Add Baby
            </button>
          </div>
        ) : (
          babies.map((baby, index) => (
            <div
              key={baby.id}
              className="animate-section-enter"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {editingId === baby.id ? (
                /* Edit form */
                <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-peach-300">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">✏️</span>
                    <h3 className="font-semibold text-gray-800">
                      Edit Profile
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={editBirthDate}
                        onChange={(e) => setEditBirthDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-peach-400 to-peach-500 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : deleteConfirm === baby.id ? (
                /* Delete confirmation */
                <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-red-200">
                  <div className="text-center">
                    <span className="text-3xl block mb-2">⚠️</span>
                    <p className="font-semibold text-gray-800">
                      Delete {baby.name}&apos;s profile?
                    </p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      This will delete all food logs and reactions. This cannot
                      be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteBaby(baby.id)}
                        disabled={saving}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      >
                        {saving ? "Deleting..." : "Yes, Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Baby card */
                <div
                  className={`bg-white rounded-3xl p-5 shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                    baby.id === activeBabyId
                      ? "border-peach-300 shadow-peach-100/50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        baby.id === activeBabyId
                          ? "bg-peach-100"
                          : "bg-gray-100"
                      }`}
                    >
                      👶
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {baby.name}
                        </h3>
                        {baby.id === activeBabyId && (
                          <span className="text-[10px] font-bold text-peach-600 bg-peach-50 px-2 py-0.5 rounded-full shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {getAge(baby.birthDate)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Born {formatDate(baby.birthDate)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    {baby.id !== activeBabyId && (
                      <button
                        onClick={() => selectBaby(baby.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-mint-700 bg-mint-50 border border-mint-200 hover:bg-mint-100 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        ✓ Select
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(baby)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(baby.id)}
                      className="py-2 px-4 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Add Baby Form */}
        {showAddForm ? (
          <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-mint-300 animate-section-enter">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🍼</span>
              <h3 className="font-semibold text-gray-800">Add New Baby</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Baby&apos;s Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                    👶
                  </span>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Luna"
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Birth Date
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                    🎂
                  </span>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={addBaby}
                  disabled={saving || !newName.trim() || !newBirthDate}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-mint-400 to-mint-500 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Creating..." : "Create Baby Profile 🍼"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName("");
                    setNewBirthDate("");
                    setError(null);
                  }}
                  className="py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : babies.length > 0 ? (
          <button
            onClick={() => {
              setShowAddForm(true);
              setError(null);
            }}
            className="w-full py-4 rounded-3xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-400 hover:border-mint-400 hover:text-mint-600 hover:bg-mint-50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            + Add Another Baby
          </button>
        ) : null}

        {/* Logout */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
