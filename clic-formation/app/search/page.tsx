import { db } from "@/db";
import { lessons, navNodes } from "@/db/schema";
import { ilike, or, eq } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, ChevronRight, Search as SearchIcon, FileText } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;

  if (!query || query.trim().length < 2) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchIcon className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Recherche</h1>
        <p className="text-slate-500 mt-2">Veuillez saisir au moins 2 caractères pour lancer une recherche.</p>
      </div>
    );
  }

  const searchTerm = `%${query.trim()}%`;

  // Search lessons by title or content
  const lessonResults = await db.query.lessons.findMany({
    where: or(
      ilike(lessons.title, searchTerm),
      ilike(lessons.htmlContent, searchTerm),
      ilike(lessons.urlPath, searchTerm)
    ),
    limit: 40,
  });

  if (lessonResults.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <SearchIcon className="w-8 h-8 text-blue-600" />
            Résultats pour &ldquo;{query}&rdquo;
          </h1>
          <p className="text-slate-500 mt-2">0 résultat trouvé</p>
        </header>
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
          <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900">Aucun résultat trouvé</p>
          <p className="text-slate-500 mt-1">Essayez avec d'autres mots-clés comme "Excel", "Mise en page" ou "Calcul".</p>
        </div>
      </div>
    );
  }

  const lessonIds = lessonResults.map(l => l.id);

  // Fetch all navigation paths for all lessons in ONE query to avoid connection pool exhaustion
  const allNavPaths = await db.query.navNodes.findMany({
    where: (nodes, { inArray }) => inArray(nodes.lessonId, lessonIds),
    with: {
      parent: {
        with: {
          parent: {
            with: {
              parent: {
                with: {
                  parent: true
                }
              }
            }
          }
        }
      }
    }
  });

  // Group nav paths by lessonId
  const pathsByLessonId = allNavPaths.reduce((acc, nav) => {
    if (!nav.lessonId) return acc;
    if (!acc[nav.lessonId]) acc[nav.lessonId] = [];
    
    const parts = [];
    let current: any = nav;
    while (current) {
      parts.unshift(current.slug);
      current = current.parent;
    }
    
    acc[nav.lessonId].push({
      url: `/course/${parts.join("/")}`,
      breadcrumb: parts.join(" > "),
    });
    
    return acc;
  }, {} as Record<number, { url: string; breadcrumb: string }[]>);

  const filteredResults = lessonResults
    .map(lesson => ({
      ...lesson,
      navPaths: pathsByLessonId[lesson.id] || []
    }))
    .filter(r => r.navPaths.length > 0);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Résultats pour &ldquo;{query}&rdquo;
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {filteredResults.length} résultat{filteredResults.length !== 1 ? "s" : ""} trouvé{filteredResults.length !== 1 ? "s" : ""}
        </p>
      </header>

      {filteredResults.length > 0 ? (
        <div className="space-y-4">
          {filteredResults.map((lesson) => (
            <div key={lesson.id} className="relative bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <Link 
                      href={lesson.navPaths[0].url} 
                      className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors after:absolute after:inset-0 after:z-0"
                    >
                      {lesson.title}
                    </Link>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-3 relative z-10">
                    {lesson.navPaths.map((path, idx) => (
                      <Link
                        key={idx}
                        href={path.url}
                        className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-900/50"
                      >
                        <BookOpen className="w-3 h-3 mr-2 text-slate-400" />
                        <span className="truncate max-w-lg">{path.breadcrumb}</span>
                        <ChevronRight className="w-3 h-3 ml-auto text-slate-300 dark:text-slate-600" />
                      </Link>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                  {lesson.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <SearchIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900 dark:text-slate-50">Aucun résultat trouvé</p>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Essayez avec d'autres mots-clés comme "Excel", "Mise en page" ou "Calcul".</p>
        </div>
      )}
    </div>
  );
}
