# Phase 4: Frontend Architecture & SSG Implementation

This phase focuses on building the core user interface and implementing Static Site Generation (SSG) to ensure lightning-fast performance for the migrated tutorials.

### 1. Global Layout & Dynamic Lesson Sidebar

The global layout includes a responsive Navbar and a Sidebar that dynamically retrieves categories and their associated lessons directly from the database to build the navigation tree.

**File:** `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { db } from "@/db";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clic-Formation - Apprendre l'informatique",
  description: "Plateforme d'auto-formation interactive",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data from DB
  const categoriesWithLessons = await db.query.categories.findMany({
    with: {
      lessons: {
        columns: {
          title: true,
          slug: true,
        },
        orderBy: (lessons, { asc }) => [asc(lessons.orderIndex)],
      },
    },
  });

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen flex-col">
          {/* Navbar */}
          <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
            <div className="container flex h-16 items-center justify-between px-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                CLIC-FORMATION
              </Link>
              <nav className="flex gap-6 font-medium">
                <Link href="/tutorials" className="hover:text-blue-600">Cours</Link>
                <Link href="/quizzes" className="hover:text-blue-600">Quizz</Link>
                <Link href="/dashboard" className="hover:text-blue-600">Mon Espace</Link>
              </nav>
            </div>
          </header>

          <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
            {/* Dynamic Lesson Sidebar */}
            <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
              <div className="py-6 pr-6 lg:py-8">
                {categoriesWithLessons.map((category) => (
                  <div key={category.id} className="pb-4">
                    <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold uppercase tracking-wider text-slate-500">
                      {category.name}
                    </h4>
                    <div className="grid grid-flow-row auto-rows-max text-sm">
                      {category.lessons.map((lesson) => (
                        <Link
                          key={lesson.slug}
                          href={`/tutorials/${lesson.slug}`}
                          className="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {lesson.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <main className="relative py-6 lg:gap-10 lg:py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### 2. SSG Tutorial Route

This route handles the individual lesson display. It uses `generateStaticParams` to fetch all possible slugs at build time, allowing Vercel to serve them as static HTML.

**File:** `app/tutorials/[slug]/page.tsx`

```typescript
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

// SSG: Pre-generate paths for all lessons at build time
export async function generateStaticParams() {
  const allLessons = await db.query.lessons.findMany({
    columns: { slug: true },
  });

  return allLessons.map((lesson) => ({
    slug: lesson.slug,
  }));
}

export default async function TutorialPage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch lesson data using Drizzle
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.slug, params.slug),
    with: {
      category: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      {/* Breadcrumbs / Category */}
      <nav className="text-sm text-slate-500">
        <Link href="/tutorials" className="hover:underline">Cours</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-900">{lesson.category?.name}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {lesson.title}
        </h1>
        <div className="h-1 w-20 bg-blue-600"></div>
      </header>

      {/* Content Rendering */}
      <div 
        className="prose prose-slate max-w-none 
          prose-headings:font-bold prose-headings:text-slate-900 
          prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-lg"
        dangerouslySetInnerHTML={{ __html: lesson.htmlContent }}
      />

      {/* Footer Navigation */}
      <footer className="mt-12 border-t pt-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500 italic">
            Dernière mise à jour: {lesson.createdAt.toLocaleDateString('fr-FR')}
          </p>
          <Link 
            href="/quizzes" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            Passer le Quizz
          </Link>
        </div>
      </footer>
    </article>
  );
}
```

### 3. Styling Configuration (Tailwind Typography)

To ensure the migrated HTML content looks professional, install the Tailwind Typography plugin.

```bash
# Install the typography plugin
npm install -D @tailwindcss/typography
```

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"), // Enables the 'prose' class
  ],
};
export default config;
```

### 4. Milestone/Outcome
A high-performance frontend where every tutorial page is pre-rendered as static HTML. Navigation is seamless via a dynamic sidebar, and the legacy content is rendered with modern, clean typography while preserving the original educational structure.
