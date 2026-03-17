"use client";

import { useState, useRef, useEffect } from "react";
import { useBaby } from "./BabyContext";
import Link from "next/link";
import { getAgeShortLabel } from "@/lib/babyAge";

export default function BabySwitcher() {
  const { babies, activeBaby, selectBaby } = useBaby();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeBaby) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-peach-300 hover:bg-peach-50 transition-all duration-200 cursor-pointer active:scale-[0.97]"
      >
        <span className="text-lg">👶</span>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {activeBaby.name}
          </p>
          <p className="text-[10px] text-gray-400">
            {getAgeShortLabel(new Date(activeBaby.birthDate))}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 z-50 overflow-hidden animate-dropdown-enter">
          <div className="p-1.5">
            {babies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => {
                  selectBaby(baby.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  baby.id === activeBaby.id
                    ? "bg-peach-50 border border-peach-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <span className="text-lg">👶</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {baby.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {getAgeShortLabel(new Date(baby.birthDate))}
                  </p>
                </div>
                {baby.id === activeBaby.id && (
                  <svg
                    className="w-4 h-4 text-peach-500 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 p-1.5">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-mint-50 transition-all duration-150 w-full"
            >
              <span className="w-7 h-7 bg-mint-100 rounded-full flex items-center justify-center text-sm">
                +
              </span>
              <span className="text-sm font-medium text-mint-700">
                Manage Babies
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
