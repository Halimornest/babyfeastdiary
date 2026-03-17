"use client";

import { useState } from "react";
import type { RadioCardProps } from "@/app/types/food";

export default function RadioCard({ label, selected, onClick, emoji }: RadioCardProps) {
  const [animClass, setAnimClass] = useState("");

  const handleClick = () => {
    if (!selected) {
      setAnimClass("animate-chip-pop");
      setTimeout(() => setAnimClass(""), 350);
    }
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium
        border-2 cursor-pointer w-full
        transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out
        active:scale-[0.98]
        ${animClass}
        ${
          selected
            ? "bg-mint-100 border-mint-400 text-mint-800 shadow-md shadow-mint-200/50"
            : "bg-white border-gray-200 text-gray-600 hover:border-mint-300 hover:bg-mint-50 hover:shadow-sm"
        }
      `}
    >
      <span
        className={`
        w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
        transition-all duration-200
        ${selected ? "border-mint-500 bg-mint-500 shadow-sm shadow-mint-300" : "border-gray-300 group-hover:border-mint-400"}
      `}
      >
        {selected && (
          <span className="w-2 h-2 rounded-full bg-white animate-radio-fill" />
        )}
      </span>
      {emoji && (
        <span className={`text-base transition-transform duration-200 ${selected ? "scale-110" : "group-hover:scale-110"}`}>
          {emoji}
        </span>
      )}
      {label}
    </button>
  );
}
