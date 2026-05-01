import { db } from "@/db";
import { navNodes } from "@/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, BookOpen, ChevronRight } from "lucide-react";
import DOMPurify from 'isomorphic-dompurify';

function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 mb-8 lg:mb-0 z-10">
      <details className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm lg:hidden mb-4">
        <summary className="p-4 font-bold text-slate-900 dark:text-slate-50 flex justify-between items-center cursor-pointer list-none">
          Navigation du cours
          <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </details>
      <aside className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm hidden lg:block h-auto lg:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
        {children}
      </aside>
    </div>
  );
}

type Props = {
  params: Promise<{ slug: string[] }>;
};

function Badge({ children, type }: { children: React.ReactNode, type: string }) {
  const getColors = () => {
    switch (type.toLowerCase()) {
      case "support": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "exercice": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "quizz": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      default: return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
    }
  };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-md ml-2 inline-flex items-center ${getColors()}`}>
      {children}
    </span>
  );
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch all potential nodes matching any of the slug segments in one query
  const matchingNodes = await db.query.navNodes.findMany({
    where: inArray(navNodes.slug, slug),
    with: {
      hub: true,
      section: true,
      topic: true,
      lesson: true,
    }
  });

  // Reconstruct and validate the path in memory
  let parentId: number | null = null;
  let currentNode: any = null;
  const pathNodes = [];

  for (const segment of slug) {
    const node = matchingNodes.find(n => 
      n.slug === segment && 
      (parentId === null ? n.parentId === null : n.parentId === parentId)
    );
    
    if (!node) notFound();
    currentNode = node;
    parentId = node.id;
    pathNodes.push(node);
  }

  // 1. Hub Landing Page
  if (currentNode.hubId !== null) {
    // Fetch the full tree up to Topics
    const tree = await db.query.navNodes.findFirst({
      where: eq(navNodes.id, currentNode.id),
      with: {
        hub: true,
        children: { // Sections
          orderBy: (c, { asc }) => [asc(c.position)],
          with: {
            section: true,
            children: { // Topics
              orderBy: (c, { asc }) => [asc(c.position)],
              with: { 
                topic: true,
                children: { // Lessons (just to count or link to first)
                  orderBy: (c, { asc }) => [asc(c.position)],
                  with: { lesson: true }
                }
              }
            }
          }
        }
      }
    });

    if (!tree || !tree.hub) notFound();

    // Find the first lesson to use for the "Resume" banner
    let firstLessonPath = "";
    let firstLessonTitle = "";
    let firstSectionName = "";
    const firstSect = tree.children[0];
    const firstTopic = firstSect?.children[0];
    const firstLes = firstTopic?.children[0];

    if (firstSect && firstTopic && firstLes) {
      firstLessonPath = `/course/${tree.slug}/${firstSect.slug}/${firstTopic.slug}/${firstLes.slug}`;
      firstLessonTitle = firstLes.lesson.title;
      firstSectionName = firstSect.section.name;
    }

    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Contextual Sidebar - Simplified */}
        <SidebarWrapper>
           <div className="mb-6">
             <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">{tree.hub.name}</h3>
             <div className="relative group">
               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
               <input
                 type="text"
                 placeholder="Filtrer..."
                 className="w-full px-4 py-2 pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-blue-300 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all outline-none text-slate-900 dark:text-slate-50"
               />
             </div>
           </div>
           <div className="space-y-4">
             {tree.children.map((secNav: any) => (
               <details key={secNav.id} className="group">
                 <summary className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors list-none flex items-center justify-between">
                   {secNav.section.name}
                   <span className="text-slate-400 group-open:rotate-90 transition-transform">›</span>
                 </summary>
                 <ul className="space-y-2 mt-3 pl-2 border-l-2 border-slate-100 dark:border-slate-800">
                   {secNav.children.map((topNav: any) => {
                     const firstLesson = topNav.children?.[0];
                     const topicHref = firstLesson
                       ? `/course/${tree.slug}/${secNav.slug}/${topNav.slug}/${firstLesson.slug}`
                       : '#';
                     return (
                       <li key={topNav.id}>
                         <Link
                           href={topicHref}
                           className="text-slate-600 hover:text-blue-600 text-sm font-medium block py-1 transition-colors"
                         >
                           {topNav.topic.name}
                         </Link>
                       </li>
                     );
                   })}
                 </ul>
               </details>
             ))}
           </div>
        </SidebarWrapper>
        
        <main className="flex-1 w-full">
          <header className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              {tree.hub.name}
            </h1>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
            <p className="mt-4 text-lg text-slate-600">Explorez les sections et sujets de ce parcours.</p>
          </header>

          {/* Resume Banner */}
          {firstLessonPath !== "" && (
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 mb-10 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-sm font-bold tracking-widest text-blue-300 uppercase mb-2">Reprendre l'apprentissage</h2>
                <p className="text-2xl font-bold">{firstLessonTitle}</p>
                <p className="text-blue-100/80 mt-1">{firstSectionName}</p>
              </div>
              <Link 
                href={firstLessonPath}
                className="shrink-0 bg-white text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
              >
                Continuer
              </Link>
            </div>
          )}

          {/* Hub Landing Grid - Cleaned Up */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {tree.children.map((secNav: any) => {
              const topicCount = secNav.children.length;
              const firstTop = secNav.children[0];
              const firstLes = firstTop?.children[0];
              const commencePath = firstLes ? `/course/${tree.slug}/${secNav.slug}/${firstTop.slug}/${firstLes.slug}` : '#';

              return (
                <section key={secNav.id} className="bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                   <div className="flex-1">
                     <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-50">{secNav.section.name}</h2>
                     <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                       {topicCount} {topicCount === 1 ? 'Sujet' : 'Sujets'}
                     </p>
                     <ul className="space-y-2">
                       {secNav.children.map((topNav: any) => (
                         <li key={topNav.id} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                           <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full mr-2"></span>
                           {topNav.topic.name}
                         </li>
                       ))}
                     </ul>
                   </div>
                   
                   {firstLes && (
                     <Link 
                       href={commencePath}
                       className="mt-6 block w-full text-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 font-bold py-3 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                     >
                       Commencer
                     </Link>
                   )}
                </section>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // 2. Lesson Page
  if (currentNode.lessonId !== null) {
    const rootHubNav = pathNodes[0];
    
    // Fetch full tree for the sidebar
    const tree = await db.query.navNodes.findFirst({
      where: eq(navNodes.id, rootHubNav.id),
      with: {
        hub: true,
        children: { // Sections
          orderBy: (c, { asc }) => [asc(c.position)],
          with: {
            section: true,
            children: { // Topics
              orderBy: (c, { asc }) => [asc(c.position)],
              with: { 
                topic: true,
                children: { // Lessons
                  orderBy: (c, { asc }) => [asc(c.position)],
                  with: { lesson: true }
                }
              }
            }
          }
        }
      }
    });

    if (!tree) notFound();

    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start">
         {/* Contextual Sidebar - Showing Lessons */}
          <SidebarWrapper>
              <Link href={`/course/${tree.slug}`} className="block font-extrabold text-xl mb-6 text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {tree.hub.name}
              </Link>
              <div className="space-y-4 h-auto pr-2">
                {tree.children.map((secNav: any) => {
                  const isActiveSection = pathNodes[1]?.id === secNav.id;
                  return (
                    <details key={secNav.id} className="group" open={isActiveSection}>
                      <summary className={`font-bold text-sm tracking-wide uppercase cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors list-none flex items-center justify-between ${isActiveSection ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {secNav.section.name}
                        <span className={`text-slate-400 transition-transform ${isActiveSection ? 'rotate-90' : 'group-open:rotate-90'}`}>›</span>
                      </summary>
                      <div className="space-y-4 mt-3 pl-2 border-l-2 border-slate-100 dark:border-slate-800">
                       {secNav.children.map((topNav: any) => {
                         const isActiveTopic = pathNodes[2]?.id === topNav.id;
                         return (
                           <details key={topNav.id} className="group/topic" open={isActiveTopic}>
                             <summary className="font-semibold text-slate-700 dark:text-slate-300 text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors list-none flex items-center justify-between">
                               {topNav.topic.name}
                               <span className={`text-slate-400 transition-transform text-xs ${isActiveTopic ? 'rotate-90' : 'group-open/topic:rotate-90'}`}>›</span>
                             </summary>
                             <ul className="space-y-1 mt-2 pl-2 border-l-2 border-slate-50 dark:border-slate-800">
                               {topNav.children.map((lesNav: any) => {
                                 const isActiveLesson = currentNode.id === lesNav.id;
                                 const lessonUrl = `/course/${tree.slug}/${secNav.slug}/${topNav.slug}/${lesNav.slug}`;
                                 return (
                                   <li key={lesNav.id}>
                                     <Link 
                                       href={lessonUrl}
                                       className={`text-sm font-medium flex items-start group/les transition-colors ${isActiveLesson ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 -mx-2 px-2 py-1 rounded-md' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 block py-1'}`}
                                     >
                                       <span className={`mr-2 transition-opacity ${isActiveLesson ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-0 group-hover/les:opacity-100 text-blue-600 dark:text-blue-400 hidden'}`}>›</span>
                                       {lesNav.lesson.title}
                                     </Link>
                                   </li>
                                 );
                               })}
                             </ul>
                           </details>
                         );
                       })}
                     </div>
                   </details>
                 );
               })}
             </div>
          </SidebarWrapper>
         
          <main className="flex-1 w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 lg:p-12 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
               <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Accueil</Link>
               <span>/</span>
               <Link href={`/course/${tree.slug}`} className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">{tree.hub.name}</Link>
               <span>/</span>
               <span className="text-slate-400 dark:text-slate-500">{pathNodes[1]?.section?.name}</span>
               <span>/</span>
               <span className="text-slate-400 dark:text-slate-500">{pathNodes[2]?.topic?.name}</span>
            </nav>
   
            <header className="mb-10">
              <div className="mb-4">
                 <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                   {currentNode.lesson.type}
                 </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-6">
                {currentNode.lesson.title}
              </h1>
              <div className="h-1 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </header>
   
            {/* Content */}
            <div 
              className="prose prose-slate dark:prose-invert prose-lg max-w-none 
                prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-50 prose-headings:tracking-tight
                prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-lg prose-img:shadow-black/50 prose-img:mx-auto prose-img:border prose-img:border-slate-100 dark:prose-img:border-slate-700 dark:prose-img:opacity-90
                prose-strong:text-slate-900 dark:prose-strong:text-slate-50 prose-strong:font-bold
                prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:marker:text-slate-400 dark:prose-li:marker:text-slate-500
                prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-slate-50 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-slate-900 dark:prose-pre:bg-black prose-pre:text-slate-50 dark:prose-pre:text-slate-200 prose-pre:border prose-pre:border-slate-800"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentNode.lesson.htmlContent) }} 
            />
          </main>
      </div>
    );
  }

  // Not Hub or Lesson? It's a Section or Topic directly accessed. Redirect to first lesson.
  if (currentNode.sectionId !== null || currentNode.topicId !== null) {
    const firstLessonNode = await db.query.navNodes.findFirst({
      where: and(
        isNotNull(navNodes.lessonId),
        currentNode.sectionId !== null ? eq(navNodes.sectionId, currentNode.sectionId) : undefined,
        currentNode.topicId !== null ? eq(navNodes.topicId, currentNode.topicId) : undefined
      ),
      orderBy: (n, { asc }) => [asc(n.id)],
      with: { lesson: true }
    });

    if (firstLessonNode && firstLessonNode.lesson) {
      const { redirect } = await import("next/navigation");
      redirect(`/course/${firstLessonNode.lesson.urlPath}`);
    }
  }

  notFound();
}
