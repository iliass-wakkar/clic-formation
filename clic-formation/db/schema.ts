import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  integer, 
  timestamp, 
  uuid, 
  jsonb, 
  primaryKey,
  boolean,
  foreignKey
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

// 1. Hubs
export const hubs = pgTable("hubs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
});

// 2. Sections
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  hubId: integer("hub_id").references(() => hubs.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// 3. Topics
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
});

// 4. Lessons
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  urlPath: varchar("url_path", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  htmlContent: text("html_content").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
});

// Navigation Tree
export const navNodes = pgTable("nav_nodes", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"), // self-referencing
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(), // single URL segment
  position: integer("position").notNull(), // ordering
  
  hubId: integer("hub_id").references(() => hubs.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, { onDelete: "cascade" }),
  topicId: integer("topic_id").references(() => topics.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
  parentFk: foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
    name: "nav_nodes_parent_id_fk"
  }).onDelete("cascade")
}));

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

export const hubsRelations = relations(hubs, ({ many }) => ({
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  hub: one(hubs, {
    fields: [sections.hubId],
    references: [hubs.id],
  }),
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  section: one(sections, {
    fields: [topics.sectionId],
    references: [sections.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  topic: one(topics, {
    fields: [lessons.topicId],
    references: [topics.id],
  }),
  quizzes: many(quizzes),
}));

export const navNodesRelations = relations(navNodes, ({ one, many }) => ({
  parent: one(navNodes, { fields: [navNodes.parentId], references: [navNodes.id], relationName: "navNodesHierarchy" }),
  children: many(navNodes, { relationName: "navNodesHierarchy" }),
  hub: one(hubs, { fields: [navNodes.hubId], references: [hubs.id] }),
  section: one(sections, { fields: [navNodes.sectionId], references: [sections.id] }),
  topic: one(topics, { fields: [navNodes.topicId], references: [topics.id] }),
  lesson: one(lessons, { fields: [navNodes.lessonId], references: [lessons.id] }),
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

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));
