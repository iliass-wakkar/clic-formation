import { db } from "@/db";
import { lessons, quizzes } from "@/db/schema";
import { eq } from "drizzle-orm";
import QuizComponent from "@/components/QuizComponent";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as jose from "jose";

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { lesson: lessonSlug } = await searchParams;

  // Check auth
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  if (!lessonSlug) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Choisissez un tutoriel pour commencer le quiz</h1>
        <p className="text-slate-500">Sélectionnez un cours dans le catalogue pour tester vos connaissances.</p>
      </div>
    );
  }

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.slug, lessonSlug),
    with: {
      quizzes: true,
    }
  });

  if (!lesson) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900">Évaluation : {lesson.title}</h1>
        <p className="text-slate-500">Répondez aux questions pour valider vos acquis.</p>
      </div>

      <QuizComponent 
        lessonId={lesson.id} 
        questions={lesson.quizzes.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        }))} 
      />
    </div>
  );
}
