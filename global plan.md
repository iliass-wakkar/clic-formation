# Global Master Plan (Refined)

This master plan outlines the chronological steps to rebuild the Clic-Formation platform into a modern, high-performance web application using the specified Next.js and Serverless PostgreSQL stack, with specific safeguards for Edge runtime compatibility and repository scalability.

### Phase 1: Database Infrastructure & Schema Design
*   **Neon Setup:** Create a Serverless PostgreSQL project on Neon.tech and configure connection strings.
*   **Drizzle Initialization:** Initialize Drizzle ORM within the Next.js project and configure the `drizzle.config.ts`.
*   **Schema Definition:** Design and implement relational models for `users`, `categories`, `lessons`, `quizzes`, and `user_progress`.
*   **Migration Execution:** Generate SQL migrations and push the schema to the database (Local Docker for Dev, Neon for Prod).
*   **Milestone:** A fully operational relational database with a verified connection to the Next.js backend.

### Phase 2: Secure Custom Authentication (Edge-Compatible)
*   **API Route Development:** Create secure registration and login routes with password hashing (`bcryptjs`).
*   **JWT Implementation:** Sign JWTs and store them in `HTTP-only`, `Secure`, `SameSite=Strict` cookies.
*   **Edge Runtime Security:** Use the `jose` library for JWT verification within Next.js Middleware to ensure compatibility.
*   **Milestone:** A secure, local-only authentication flow that protects sensitive routes like `/dashboard`.

### Phase 3: Data Extraction & Object Storage Migration
*   **Extraction Script:** A Node.js (Cheerio) script to crawl legacy HTML files, sanitize content, and resolve image paths.
*   **Scalable Media Strategy:** Upload legacy images to Object Storage (R2/S3) instead of Git. Use a local fallback for development.
*   **Database Migration:** Push cleaned HTML content and permanent media URLs to the PostgreSQL `lessons` table.
*   **Milestone:** 3,000+ tutorials migrated to a structured database without repo bloat.

### Phase 4: Frontend Architecture & SSG Implementation
*   **Static Generation (SSG):** Pre-render all lesson pages at build time using `generateStaticParams` for instant performance.
*   **Dynamic UI:** Build a responsive Navbar and a dynamic Lesson Sidebar using Drizzle relational queries.
*   **Rich Rendering:** Use Tailwind Typography (`prose`) to style migrated content professionally.
*   **Milestone:** A high-speed tutorial library serving pre-rendered content.

### Phase 4.5: Design System & UX Architecture
*   **Semantic Tokens:** Implement a WCAG-compliant color system (`slate`, `blue`, `emerald`, `amber`) for low eye strain.
*   **Information Architecture:** Define data targets for Home, Library, Path, Lesson, and Dashboard views.
*   **Bento Dashboard:** Design a responsive grid system to prioritize learner focus and metrics.
*   **UX Enhancements:** Add reading progress bars and skeleton loaders to improve perceived performance.
*   **Milestone:** A polished, professional UI/UX that facilitates long-term study sessions.

### Phase 5: Interactive Features & Progress Tracking
*   **Quiz Engine:** A session-aware React component for real-time testing with instant feedback.
*   **Progress API:** Secure Server Actions to track lesson completion and quiz scores.
*   **Scalable Dashboard:** High-performance aggregate queries with limits to ensure fast loads even with thousands of lessons.
*   **Automated UX:** Implement "Auto-Progress" tracking when a student reaches the end of a lesson.
*   **Milestone:** A gamified learning experience with real-time feedback and persistent progress.

### Phase 6: Vercel Deployment & Optimization
*   **Environment Sync:** Securely bridge secrets (DB URLs, JWT keys, S3 credentials) to Vercel.
*   **CI/CD Pipeline:** Automated production builds with asset optimization.
*   **Final Audit:** Verify Edge runtime security and SSG integrity in the live environment.
*   **Milestone:** The Clic-Formation platform is globally available, secure, and optimized for scale.
