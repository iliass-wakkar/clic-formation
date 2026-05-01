"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import { Suspense } from "react";

type Hub = {
  id: number;
  name: string;
  slug: string;
};

export default function Navbar({ hubs }: { hubs: Hub[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-50 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Top row: Logo + Search + Mobile Toggle */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="w-10 h-10 bg-slate-900 dark:bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-sm">CF</span>
            <span className="font-dosis text-2xl font-bold tracking-wider text-slate-900 dark:text-slate-50">CLIC-FORMATION</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Suspense fallback={<div className="w-64 h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />}>
              <SearchInput />
            </Suspense>
          </div>

          <button 
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 dark:border-slate-800">
            <Suspense fallback={<div className="w-full h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />}>
              <SearchInput />
            </Suspense>
          </div>
        )}

        {/* Hub navigation row */}
        <nav className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row flex-wrap gap-1 pb-3 border-t border-slate-100 dark:border-slate-800 md:border-0 pt-3 md:pt-0`} aria-label="Navigation principale">
          {hubs.map((hub) => {
            const isActive = pathname.startsWith(`/course/${hub.slug}`);
            return (
              <Link
                key={hub.id}
                href={`/course/${hub.slug}`}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  isActive 
                    ? "bg-slate-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {hub.name}
              </Link>
            );
          })}
          {/* Fixed links */}
          <Link href="/quizzes" className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors md:ml-auto" onClick={() => setIsOpen(false)}>
            Liste Quizz
          </Link>
          <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
            Utilisateur
          </Link>
        </nav>
      </div>
    </header>
  );
}
