"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Suggestion {
  id: number;
  title: string;
  urlPath: string;
  type: string;
}

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full md:w-64" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 group z-10">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          )}
        </button>
        <input
          name="q"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Chercher un exercice..."
          className="px-4 py-2 pl-10 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-sm focus:border-blue-300 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none w-full shadow-sm text-slate-900 dark:text-slate-50"
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2) && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full mt-2 w-full md:w-80 left-0 md:left-auto md:right-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              Suggestions
            </span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {isLoading && suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Chargement...
              </div>
            ) : (
              <>
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/course/${item.urlPath}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                      <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase">
                        {item.type}
                      </p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
                
                <button
                  onClick={handleSubmit}
                  className="w-full p-3 text-left border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium"
                >
                  <Search className="w-4 h-4" />
                  Voir tous les résultats pour "{query}"
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
