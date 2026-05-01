import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
    />
  );
}

export function LessonCardSkeleton() {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
      <div className="flex justify-between">
        <Skeleton className="w-9 h-9" />
        <Skeleton className="w-16 h-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-2/3 h-5" />
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="w-24 h-4" />
      </div>
    </div>
  );
}
