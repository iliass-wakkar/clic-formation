import "dotenv/config";
import { db } from "../db";
import { lessons } from "../db/schema";

async function main() {
  const allLessons = await db.select({ htmlContent: lessons.htmlContent }).from(lessons).limit(20);
  
  const imgSrcs = new Set<string>();
  
  for (const lesson of allLessons) {
    const matches = lesson.htmlContent.matchAll(/src="([^"]*)"/g);
    for (const m of matches) {
      imgSrcs.add(m[1]);
    }
  }
  
  console.log("=== Sample img src values from first 20 lessons ===");
  for (const src of imgSrcs) {
    console.log(src);
  }
  console.log(`\nTotal unique image references: ${imgSrcs.size}`);
  
  process.exit(0);
}

main().catch(console.error);
