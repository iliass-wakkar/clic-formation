import "dotenv/config";
import { db } from "../db";
import { hubs, sections, topics, lessons } from "../db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  try {
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
      
    console.log("Success:", hubStatsRaw);
  } catch (error) {
    console.error("DB Error:", error);
  }
  process.exit(0);
}

main();
