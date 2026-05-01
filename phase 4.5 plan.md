# Phase 4.5: Design System & UX Architecture

This phase defines the aesthetic and structural design language of the Clic-Formation platform, prioritizing readability for 3,000+ tutorials and high-performance metrics for the learner dashboard.

### 1. Semantic Color System & Accessibility
Ensures WCAG 2.1 Level AA compliance (4.5:1 contrast) and reduces cognitive load during long study sessions.

| Role | Light Token | Dark Token | Logic |
| :--- | :--- | :--- | :--- |
| **Background** | `slate-50` | `slate-950` | Reduces eye strain; provides depth for surfaces. |
| **Surface** | `white` | `slate-900` | High-contrast area for main tutorial content. |
| **Primary** | `blue-600` | `blue-500` | Interactive elements; 4.5:1 ratio on background. |
| **Success** | `emerald-600` | `emerald-500` | Progression/Complete; recognizable signifier. |
| **Warning** | `amber-500` | `amber-400` | Intermediate status; requires sufficient contrast. |
| **Border** | `slate-200` | `slate-800` | Defines structural boundaries without visual noise. |

*   **State Management:** Hover states use 10% brightness shift (`hover:bg-blue-700`). Focus states use `ring-2 ring-offset-2`.
*   **Typography:** Cap line length at 65–75 characters in `.prose` containers for optimal readability.

### 2. Functional Information Architecture
| Page | Primary Data Target | Key Functional Component |
| :--- | :--- | :--- |
| **1. Home** | Global Search & Entry | Command-K search bar + High-level Category Cards. |
| **2. Library** | 3,000+ Record Query | Faceted sidebar (Filter by Software, Level, Topic). |
| **3. Path** | Relational Course Set | Sequenced lesson list with completion state markers. |
| **4. Lesson** | Rich Text Data | `prose` container + Intersection Observer for Reading Progress. |
| **5. Dashboard** | User Progress Aggregates | Bento Grid for personalized metrics. |
| **6. Search** | Full-text Index Match | Result list with keyword highlighting and breadcrumbs. |
| **7. Auth** | User Session Creation | Standard form with server-side validation. |

### 3. The Dashboard: Bento Grid Content Strategy
Utilizes a responsive grid to prioritize learner metrics.
*   **Slot A (2x2 - Large):** Current Focus. Most recent tutorial with a "Resume" button and category progress bar.
*   **Slot B (2x1 - Wide):** Progression Overview. "Completed" vs. "Total" (3,000+) bar chart.
*   **Slot C (1x1 - Small):** Streak/Frequency. Heatmap showing days active in the current week.
*   **Slot D (1x1 - Small):** Achievements. Total points or count of passed quizzes.
*   **Slot E (Remaining Space):** Quick Links. Top 5 suggested tutorials based on high-interest categories.

### 4. Extended Execution Roadmap
1.  **Design Tokens:** Define the semantic color object and spacing scale in `tailwind.config.ts`.
2.  **Core Components:** Build `LessonCard` and implement the Library Grid with Skeleton Loaders.
3.  **The Reading Experience:** Implement the Reading Progress Bar (fixed top) using Intersection Observer to trigger `completeLesson`.
4.  **Error & Loading States:** Create `loading.tsx` and `error.tsx` for each route to handle DB timeouts gracefully.
5.  **Progression Logic:** Connect the Dashboard "Bento" components to the Drizzle aggregate queries.
