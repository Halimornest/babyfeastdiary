"use client";

import { useState } from "react";
import type { SelectableChipProps } from "@/app/types/food";

export default function SelectableChip({ label, selected, onClick, emoji, disabled = false }: SelectableChipProps) {
  const [animClass, setAnimClass] = useState("");

  const handleClick = () => {
    if (disabled) return;
    setAnimClass(!selected ? "animate-chip-pop" : "animate-chip-deselect");
    setTimeout(() => setAnimClass(""), 350);
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium
        border-2 select-none
        transition-[background-color,border-color,color,box-shadow] duration-200 ease-out
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer active:scale-95"}
        ${animClass}
        ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400"
            : selected
            ? "bg-peach-200 border-peach-400 text-peach-800 shadow-md shadow-peach-200/50"
            : "bg-white border-gray-200 text-gray-600 hover:border-peach-300 hover:bg-peach-50 hover:shadow-sm hover:-translate-y-0.5 hover:shadow-peach-100/50"
        }
      `}
    >
      {emoji && (
        <span className={`text-base transition-transform duration-200 ${selected ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6"}`}>
          {emoji}
        </span>
      )}
      {label}
      {selected && !disabled && (
        <svg className="w-3.5 h-3.5 ml-0.5 animate-check-pop" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
