import { db } from "@/db";
import { hubs, sections, topics, lessons, navNodes } from "@/db/schema";
import { eq, sql, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { 
  Image as ImageIcon, 
  BookOpen, 
  GraduationCap, 
  Users, 
  HelpCircle, 
  School, 
  BrainCircuit, 
  User, 
  Folder 
} from "lucide-react";
import { 
  PiMicrosoftExcelLogoFill, 
  PiMicrosoftWordLogoFill, 
  PiMicrosoftPowerpointLogoFill, 
} from "react-icons/pi";
import { TbChartPie } from "react-icons/tb";

function getHubIcon(slug: string) {
  switch (slug) {
    case "excel":
    case "tableur":
      return <PiMicrosoftExcelLogoFill className="w-8 h-8" color="#217346" />;
    case "word":
      return <PiMicrosoftWordLogoFill className="w-8 h-8" color="#2B579A" />;
    case "powerpoint":
      return <PiMicrosoftPowerpointLogoFill className="w-8 h-8" color="#B7472A" />;
    case "power-bi":
      return <TbChartPie className="w-8 h-8 text-yellow-500" />;
    case "photos":
    case "photofiltre":
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    case "publisher":
      return <BookOpen className="w-8 h-8 text-teal-600" />;
    case "formation":
    case "debutant":
      return <GraduationCap className="w-8 h-8 text-indigo-500" />;
    case "jeunes":
      return <Users className="w-8 h-8 text-pink-500" />;
    case "quiz":
    case "liste-quizz":
      return <HelpCircle className="w-8 h-8 text-orange-500" />;
    case "ecole":
      return <School className="w-8 h-8 text-green-600" />;
    case "jeux-de-connaissances":
      return <BrainCircuit className="w-8 h-8 text-purple-600" />;
    case "mon-espace":
    case "utilisateur":
      return <User className="w-8 h-8 text-slate-700" />;
    default:
      return <Folder className="w-8 h-8 text-slate-400" />;
  }
}

export default async function HomePage() {
  // Get Hubs with their total lesson counts using the content tables
  const hubStatsRaw = await db
    .select({
      id: hubs.id,
      name: hubs.name,
      slug: hubs.slug,
      lessonCount: sql`count(distinct ${lessons.id})`.mapWith(Number),
    })
    .from(hubs)
    .leftJoin(sections, eq(hubs.id, sections.hubId))
    .leftJoin(topics, eq(sections.id, topics.sectionId))
    .leftJoin(lessons, eq(topics.id, lessons.topicId))
    .groupBy(hubs.id, hubs.name, hubs.slug)
    .orderBy(sql`count(distinct ${lessons.id}) desc`);

  // Get latest 8 navNodes that point to lessons to build proper links
  const latestNavLessons = await db.query.navNodes.findMany({
    where: isNotNull(navNodes.lessonId),
    with: {
      lesson: true,
    },
    orderBy: (n, { desc }) => [desc(n.id)],
    limit: 8,
  });

  return (
    <div className="space-y-12">
      {/* ═══════════════════ HERO HEADING ═══════════════════ */}
      <header className="text-center md:text-left">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
          Parcours d'auto-formation informatique
        </h1>
        <div className="h-1.5 w-24 bg-blue-600 rounded-full mx-auto md:mx-0"></div>
      </header>

      {/* ═══════════════════ INFO + NEWS ROW ═══════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FONCTIONNEMENT box */}
        <section className="bg-white dark:bg-slate-800 p-8 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700/50 pb-4">
            FONCTIONNEMENT
          </h2>
          <ul className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">▸</span>
              <span>Formateurs, enseignants, si vous souhaitez mettre des contenus en ligne, utiliser <strong>info[a]clic-formation.net</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">▸</span>
              <span>Si vous constatez un dysfonctionnement, prenez le temps d'envoyer un mail <strong>info[a]clic-formation.net</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">▸</span>
              <span>Pour tous les utilisateurs connectés, vous avez la possibilité de mémoriser vos parcours et exercices effectués</span>
            </li>
          </ul>
        </section>

        {/* NOUVEAUTES box */}
        <section className="bg-white dark:bg-slate-800 p-8 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700/50 pb-4">
            NOUVEAUTÉS
          </h2>
          <ul className="space-y-3 mb-6">
            {latestNavLessons.map((nav) => {
              const fullUrl = `/course/${nav.lesson?.urlPath}`;

              return (
                <li key={nav.id} className="flex items-center text-sm font-medium">
                  <span className="text-blue-600 mr-2">▸</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate mr-2">{nav.title}</span>
                  <Link
                    href={fullUrl}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline shrink-0"
                  >
                    (Voir)
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link 
            href="/course/tableur" 
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors w-full sm:w-auto"
          >
            Liste complète
          </Link>
        </section>
      </div>

      {/* ═══════════════════ SOFTWARE HUBS ═══════════════════ */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-slate-50">Parcours Disponibles</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {hubStatsRaw.map((hub) => (
            <Link
              key={hub.id}
              href={`/course/${hub.slug}`}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {getHubIcon(hub.slug)}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{hub.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {hub.lessonCount} {hub.lessonCount === 1 ? 'leçon' : 'leçons'}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
