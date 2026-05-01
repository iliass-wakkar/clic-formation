"use client";

import { useEffect, useRef } from "react";
import { completeLesson } from "@/app/lib/actions";

export default function AutoProgress({ lessonId }: { lessonId: number }) {
  const observerRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !triggered.current) {
          triggered.current = true;
          completeLesson(lessonId);
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the tracker is visible at the bottom
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [lessonId]);

  return <div ref={observerRef} className="h-10 w-full" aria-hidden="true" />;
}
