import "dotenv/config";
import { db } from "../db";
import { lessons } from "../db/schema";
import { eq } from "drizzle-orm";

const PUBLIC_URL = process.env.S3_PUBLIC_URL!;

async function main() {
  if (!PUBLIC_URL) {
    console.error("❌ S3_PUBLIC_URL is not set in .env");
    process.exit(1);
  }

  console.log("🔄 Rewriting image src attributes in lesson HTML...");
  console.log(`🔗 CDN base URL: ${PUBLIC_URL}`);
  console.log("");

  const allLessons = await db.select({
    id: lessons.id,
    title: lessons.title,
    htmlContent: lessons.htmlContent,
  }).from(lessons);

  console.log(`📊 Found ${allLessons.length} lessons to process\n`);

  let totalRewritten = 0;
  let lessonsModified = 0;

  for (const lesson of allLessons) {
    let html = lesson.htmlContent;
    let count = 0;

    // Pattern 1: ../images/... (most common — relative paths from legacy HTML)
    html = html.replace(/src=["']\.\.\/images\//g, () => {
      count++;
      return `src="${PUBLIC_URL}/images/`;
    });

    // Pattern 2: images/... (without the ../ prefix, also found in some files)
    html = html.replace(/src=["']images\//g, () => {
      count++;
      return `src="${PUBLIC_URL}/images/`;
    });

    if (count > 0) {
      await db.update(lessons)
        .set({ htmlContent: html })
        .where(eq(lessons.id, lesson.id));

      lessonsModified++;
      totalRewritten += count;

      if (lessonsModified % 20 === 0 || lessonsModified === 1) {
        console.log(`  ✅ ${lessonsModified} lessons updated | ${totalRewritten} src attributes rewritten`);
      }
    }
  }

  console.log("\n════════════════════════════════════════");
  console.log(`🏁 Rewrite Complete!`);
  console.log(`   📝 Lessons modified: ${lessonsModified} / ${allLessons.length}`);
  console.log(`   🖼️  Image src rewritten: ${totalRewritten}`);
  console.log("════════════════════════════════════════\n");

  // Verify: check if any ../images/ references remain
  const checkLessons = await db.select({
    id: lessons.id,
    htmlContent: lessons.htmlContent,
  }).from(lessons);

  let remaining = 0;
  for (const l of checkLessons) {
    const matches = l.htmlContent.match(/src=["']\.\.\/images\//g);
    if (matches) remaining += matches.length;
  }

  if (remaining === 0) {
    console.log("✅ Verification passed: No remaining ../images/ references!");
  } else {
    console.log(`⚠️  ${remaining} references still use ../images/ — check manually.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
