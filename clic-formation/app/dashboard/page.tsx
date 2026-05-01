import { db } from "@/db";
import { lessons, userProgress } from "@/db/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { cookies } from "next/headers";
import * as jose from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Flame, 
  Trophy, 
  PlayCircle, 
  Clock, 
  ArrowRight,
  GraduationCap,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  let payload;
  try {
    const verified = await jose.jwtVerify(token, secret);
    payload = verified.payload;
  } catch {
    redirect("/login");
  }
  
  const userId = payload.id as string;
  const userEmail = payload.email as string;

  // Optimized Activity Query: Limit to 10 most recent
  const recentActivity = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, userId),
    with: { lesson: true },
    orderBy: [desc(userProgress.lastAccessedAt)],
    limit: 10,
  });

  // Optimized Count Queries
  const [totalRes] = await db.select({ value: count() }).from(lessons);
  const [completedRes] = await db.select({ value: count() })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.status, "completed")));

  const totalLessons = Number(totalRes.value);
  const completedCount = Number(completedRes.value);
  const completionRate = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Achievement Stats
  const quizAttempts = recentActivity.filter(p => p.quizScore !== null);
  const averageScore = quizAttempts.length > 0 
    ? Math.round(quizAttempts.reduce((acc, p) => acc + (p.quizScore || 0), 0) / quizAttempts.length)
    : 0;

  const currentFocus = recentActivity[0];

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Espace Apprenant</h1>
          <p className="text-slate-500 font-medium">Bon retour, <span className="text-blue-600">{userEmail}</span></p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span>Série de 3 jours</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Slot A: Current Focus (2x2) */}
        <div className="md:col-span-2 lg:col-span-3 row-span-2 p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <PlayCircle className="w-40 h-40" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-blue-500/30 rounded-full text-xs font-bold backdrop-blur-sm">
              EN COURS D&apos;APPRENTISSAGE
            </div>
            {currentFocus ? (
              <div className="space-y-2">
                <h2 className="text-3xl font-black leading-tight">
                  {currentFocus.lesson?.title}
                </h2>
                <p className="text-blue-100 font-medium opacity-80">
                  Reprenez là où vous vous êtes arrêté.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-3xl font-black leading-tight">
                  Prêt à commencer ?
                </h2>
                <p className="text-blue-100 font-medium opacity-80">
                  Choisissez votre premier tutoriel dans le catalogue.
                </p>
              </div>
            )}
          </div>

          <div className="relative z-10 pt-10">
            {currentFocus ? (
              <Link 
                href={`/course/${currentFocus.lesson?.slug}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95"
              >
                Continuer <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <Link 
                href="/course/tableur"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95"
              >
                Explorer <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        </div>

        {/* Slot B: Overall Progression (2x1) */}
        <div className="md:col-span-2 lg:col-span-3 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Progression Totale</h3>
            <BarChart3 className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-6">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-slate-900">{completionRate}%</span>
              <span className="text-sm font-bold text-slate-400 mb-2 pb-0.5">DU PROGRAMME</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-sm font-bold text-slate-500">
              {completedCount} tutoriels validés sur {totalLessons}
            </p>
          </div>
        </div>

        {/* Slot C: Frequency/Streak (1x1) */}
        <div className="md:col-span-1 lg:col-span-1 p-6 bg-orange-50 rounded-[2.5rem] border border-orange-100 flex flex-col items-center justify-center text-center space-y-2">
          <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
          <span className="text-2xl font-black text-orange-700">3</span>
          <span className="text-[10px] font-black text-orange-600/60 uppercase">JOURS ACTIFS</span>
        </div>

        {/* Slot D: Achievements (1x1) */}
        <div className="md:col-span-1 lg:col-span-2 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quizz</span>
          </div>
          <div className="space-y-1 pt-4">
            <span className="text-4xl font-black text-slate-900">{averageScore}%</span>
            <p className="text-xs font-bold text-slate-500">SCORE MOYEN</p>
          </div>
        </div>
      </div>

      {/* Recent Activity List (Slot E) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-slate-900">Activité Récente</h2>
          <button className="text-sm font-bold text-blue-600 hover:underline">Tout voir</button>
        </div>
        
        <div className="grid gap-4">
          {recentActivity.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium italic">Commencez un cours pour voir votre activity ici.</p>
            </div>
          ) : (
            recentActivity.map((item) => (
              <div key={item.lessonId} className="group p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    item.status === 'completed' ? "bg-emerald-50" : "bg-blue-50"
                  )}>
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <PlayCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.lesson?.title}</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.lastAccessedAt).toLocaleDateString('fr-FR')}
                      </span>
                      {item.quizScore !== null && (
                        <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                          Score: {item.quizScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/course/${item.lesson?.urlPath}`}
                  className="w-full sm:w-auto text-center px-6 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all text-sm"
                >
                  Reprendre
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
