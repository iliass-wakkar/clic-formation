# Phase 1: Database Infrastructure & Schema Design (Updated)

This document provides the technical steps to initialize the project and set up the relational database schema and connection using Drizzle ORM and Neon.

### 1. Project Initialization & Dependencies

Run the following commands in your terminal to create a new Next.js project and install the database stack.

```bash
# Initialize Next.js with App Router and TypeScript
npx create-next-app@latest clic-formation --typescript --tailwind --eslint --app

# Navigate to project directory
cd clic-formation

# Install Drizzle ORM and Neon Serverless driver
npm install drizzle-orm @neondatabase/serverless

# Install Drizzle Kit and Dotenv for development
npm install -D drizzle-kit dotenv
```

### 2. Drizzle Schema Definition

Create a folder named `db` in your root or `src` directory and create `schema.ts`.

**File:** `db/schema.ts`

```typescript
import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  integer, 
  timestamp, 
  uuid, 
  jsonb, 
  primaryKey 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Tables ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  htmlContent: text("html_content").notNull(),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]).notNull(), // External Object Storage URLs
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("in_progress").notNull(), // 'in_progress', 'completed'
  quizScore: integer("quiz_score"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.lessonId] }),
  };
});

// --- Relations ---

export const categoriesRelations = relations(categories, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  category: one(categories, {
    fields: [lessons.categoryId],
    references: [categories.id],
  }),
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one }) => ({
  lesson: one(lessons, {
    fields: [quizzes.lessonId],
    references: [lessons.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
}));
```

### 3. Database Connection Initialization

Create `index.ts` in your `db` folder to initialize the connection.

**File:** `db/index.ts`

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### 4. Drizzle Configuration

Create a `drizzle.config.ts` file in your root directory.

**File:** `drizzle.config.ts`

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 5. Migration Execution

Add your Neon connection string to `.env`:
`DATABASE_URL=postgresql://user:password@region.aws.neon.tech/dbname?sslmode=require`

Execute the following commands:

```bash
# Generate SQL migration files
npx drizzle-kit generate

# Push schema directly to Neon
npx drizzle-kit push
```

### 6. Milestone/Outcome
A fully initialized Next.js project with a live relational schema on Neon and a functional database client (`db`) ready to be used in your App Router components.
