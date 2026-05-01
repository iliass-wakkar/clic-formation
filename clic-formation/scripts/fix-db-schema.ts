import "dotenv/config";
import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("🔍 Checking database tables...");
    
    // Check if hubs table exists
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hubs'
    `);
    
    // Normalize rows access (drizzle-orm/postgres-js returns the rows directly or in a .rows property)
    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    const columns = rows.map((r: any) => r.column_name);
    
    console.log("Current hubs columns:", columns);

    if (columns.length === 0) {
      console.log("⚠️ Hubs table MISSING. Creating it...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "hubs" (
          "id" serial PRIMARY KEY,
          "name" varchar(255) NOT NULL,
          "slug" varchar(255) NOT NULL UNIQUE,
          "is_active" boolean DEFAULT true NOT NULL
        )
      `);
      console.log("✅ Hubs table created.");
    } else if (!columns.includes('is_active')) {
      console.log("⚠️ Hubs table missing 'is_active' column. Adding it...");
      await db.execute(sql`ALTER TABLE "hubs" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL`);
      console.log("✅ Column 'is_active' added.");
    }

    // Check sections, topics, lessons, nav_nodes
    const tablesToCreate = [
      {
        name: 'sections',
        sql: `CREATE TABLE IF NOT EXISTS "sections" (
          "id" serial PRIMARY KEY,
          "hub_id" integer NOT NULL,
          "name" varchar(255) NOT NULL,
          "slug" varchar(255) NOT NULL UNIQUE,
          "is_active" boolean DEFAULT true NOT NULL
        )`
      },
      {
        name: 'topics',
        sql: `CREATE TABLE IF NOT EXISTS "topics" (
          "id" serial PRIMARY KEY,
          "section_id" integer NOT NULL,
          "name" varchar(255) NOT NULL,
          "slug" varchar(255) NOT NULL UNIQUE,
          "is_active" boolean DEFAULT true NOT NULL
        )`
      },
      {
        name: 'lessons',
        sql: `CREATE TABLE IF NOT EXISTS "lessons" (
          "id" serial PRIMARY KEY,
          "topic_id" integer,
          "title" varchar(255) NOT NULL,
          "slug" varchar(255) NOT NULL UNIQUE,
          "type" varchar(20) DEFAULT 'support' NOT NULL,
          "html_content" text NOT NULL,
          "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
          "is_active" boolean DEFAULT true NOT NULL,
          "is_published" boolean DEFAULT true NOT NULL
        )`
      },
      {
        name: 'nav_nodes',
        sql: `CREATE TABLE IF NOT EXISTS "nav_nodes" (
          "id" serial PRIMARY KEY,
          "parent_id" integer,
          "hub_id" integer,
          "section_id" integer,
          "topic_id" integer,
          "lesson_id" integer,
          "title" varchar(255) NOT NULL,
          "slug" varchar(255) NOT NULL,
          "position" integer DEFAULT 0 NOT NULL,
          "is_active" boolean DEFAULT true NOT NULL
        )`
      }
    ];

    for (const table of tablesToCreate) {
      const check = await db.execute(sql`SELECT 1 FROM information_schema.tables WHERE table_name = ${table.name}`);
      const tableRows = Array.isArray(check) ? check : (check as any).rows || [];
      if (tableRows.length === 0) {
        console.log(`⚠️ Table ${table.name} MISSING. Creating it...`);
        await db.execute(sql.raw(table.sql));
        console.log(`✅ Table ${table.name} created.`);
      }
    }

    console.log("✅ Database check/fix complete.");
  } catch (err) {
    console.error("❌ Error fixing database:", err);
  }
  process.exit(0);
}

main();
