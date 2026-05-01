import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  title: string;
  slug: string;
  categoryName?: string;
  htmlContent: string;
  className?: string;
}

export function LessonCard({ title, slug, categoryName, htmlContent, className }: LessonCardProps) {
  // Simple reading time calculation (approx 200 words per minute)
  const wordCount = htmlContent.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link 
      href={`/course/${slug}`}
      className={cn(
        "group block p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500",
        className
      )}
    >
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          {categoryName && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {categoryName}
            </span>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-3">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Continuer</span>
          <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
