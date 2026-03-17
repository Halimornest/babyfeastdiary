"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/babies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: babyName, birthDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create baby profile");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-section-enter">
          <span className="text-5xl block mb-3">👶</span>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Baby Feast Diary!</h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Let&apos;s set up your baby&apos;s profile to start<br />
            tracking their food journey.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-section-enter section-delay-1">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="babyName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Baby&apos;s Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">👶</span>
                <input
                  id="babyName"
                  type="text"
                  required
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="e.g. Luna"
                  className="w-full pl-11 pr-4 py-3 bg-cream-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                Birth Date
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🎂</span>
                <input
                  id="birthDate"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full pl-11 pr-4 py-3 bg-cream-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-100 transition-all duration-200"
                />
              </div>
            </div>

            {/* Decorative info */}
            <div className="bg-mint-50 rounded-2xl p-4 border border-mint-200">
              <div className="flex items-start gap-3">
                <span className="text-xl">🌟</span>
                <div>
                  <p className="text-sm font-medium text-mint-800">One New Food Before One</p>
                  <p className="text-xs text-mint-600 mt-0.5 leading-relaxed">
                    We&apos;ll help you track every food your baby tries on their journey to a diverse diet.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-semibold text-white bg-linear-to-r from-peach-400 to-peach-500 rounded-2xl shadow-md shadow-peach-200/50 hover:shadow-lg hover:shadow-peach-300/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating profile...
                </span>
              ) : (
                "Create Baby Profile 🍼"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
