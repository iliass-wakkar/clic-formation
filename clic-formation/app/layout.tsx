import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { db } from "@/db";
import { hubs } from "@/db/schema";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { unstable_cache } from "next/cache";
export const metadata: Metadata = {
  title: "Clic-Formation - Parcours d'auto-formation libre d'accès",
  description:
    "Plateforme d'auto-formation informatique : plus de 3 000 exercices avec corrigés pour Excel, Word, PowerPoint, PhotoFiltre et plus.",
};

const getCachedHubs = unstable_cache(
  async () => {
    return await db.select().from(hubs).orderBy(hubs.name);
  },
  ["layout-hubs"],
  { revalidate: 3600 }
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let dynamicHubs: any[] = [];
  try {
    dynamicHubs = await getCachedHubs();
  } catch (error) {
    console.error("❌ Failed to fetch hubs:", error);
  }
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@400;600;700&family=Inter:wght@400;500;600;700;800;900&family=Raleway&family=Roboto&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen flex flex-col transition-colors duration-300" suppressHydrationWarning>
        {/* ═══════════ NAVBAR ═══════════ */}
        <Navbar hubs={dynamicHubs} />

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <div className="max-w-[1400px] mx-auto px-4 py-8 w-full flex-1">
          {children}
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
          <div className="max-w-[1400px] mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>
              © {new Date().getFullYear()} Clic-Formation — Parcours
              d&apos;auto-formation libre d&apos;accès |{" "}
              <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-50 font-medium">Connexion</Link> |{" "}
              <Link href="/register" className="hover:text-slate-900 dark:hover:text-slate-50 font-medium">Inscription</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
