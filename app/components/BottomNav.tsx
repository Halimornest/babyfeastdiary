"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-20 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        <Link
          href="/dashboard"
          className={`relative group flex flex-col items-center gap-1 min-w-14 px-3 py-2 transition-all duration-200 ${isActive("/dashboard") ? "text-peach-500" : "text-gray-400 hover:text-peach-500"}`}
        >
          <svg className="w-6 h-6 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
          <span className="text-[11px] font-medium">Dashboard</span>
          {isActive("/dashboard") && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-peach-500" />}
        </Link>

        <Link
          href="/dashboard/history"
          className={`relative group flex flex-col items-center gap-1 min-w-14 px-3 py-2 transition-all duration-200 ${isActive("/dashboard/history") ? "text-peach-500" : "text-gray-400 hover:text-peach-500"}`}
        >
          <svg className="w-6 h-6 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] font-medium">History</span>
          {isActive("/dashboard/history") && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-peach-500" />}
        </Link>

        <Link
          href="/dashboard"
          className="group flex flex-col items-center gap-1 min-w-14 px-3 py-2 text-peach-500 relative"
        >
          <div className="w-12 h-12 -mt-6 bg-linear-to-br from-peach-400 to-peach-500 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:shadow-peach-300/40 group-hover:scale-110 group-hover:-translate-y-1 group-active:scale-95">
            <svg className="w-6 h-6 text-white transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-[11px] font-bold mt-1">Add Meal</span>
        </Link>

        <Link
          href="/dashboard/summary"
          className={`relative group flex flex-col items-center gap-1 min-w-14 px-3 py-2 transition-all duration-200 ${isActive("/dashboard/summary") ? "text-peach-500" : "text-gray-400 hover:text-peach-500"}`}
        >
          <svg className="w-6 h-6 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <span className="text-[11px] font-medium">Summary</span>
          {isActive("/dashboard/summary") && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-peach-500" />}
        </Link>

        <Link
          href="/dashboard/profile"
          className={`relative group flex flex-col items-center gap-1 min-w-14 px-3 py-2 transition-all duration-200 ${isActive("/dashboard/profile") ? "text-peach-500" : "text-gray-400 hover:text-peach-500"}`}
        >
          <svg className="w-6 h-6 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-[11px] font-medium">Profile</span>
          {isActive("/dashboard/profile") && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-peach-500" />}
        </Link>
      </div>
    </nav>
  );
}
