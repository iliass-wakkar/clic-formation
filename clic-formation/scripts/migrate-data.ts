import "dotenv/config";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { db } from "../db";
import { hubs, sections, topics, lessons, navNodes } from "../db/schema";

const SOURCE_DIR = process.env.LEGACY_HTML_PATH || "";

function slugify(text: string) {
  return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
}

async function runMigration() {
  console.log("🚀 Starting Data Migration...");
  
  console.log("🧹 Clearing old records...");
  await db.delete(navNodes);
  await db.delete(lessons);
  await db.delete(topics);
  await db.delete(sections);
  await db.delete(hubs);

  const rootChildren = (require("../proposal_a_standard.json") as any).children || [];

  // Data maps to avoid duplicate inserts and quickly retrieve IDs
  const insertedHubsMap = new Map<string, number>();
  const insertedSectionsMap = new Map<string, number>();
  const insertedTopicsMap = new Map<string, number>();
  const insertedLessonsMap = new Map<string, number>();

  console.log("--- PHASE 1: CONTENT DEDUPLICATION & INSERTION ---");

  for (const hubNode of rootChildren) {
    const hubName = hubNode.title;
    const hubSlug = hubNode.url ? hubNode.url.replace(/\.html$/, "") : slugify(hubName);

    if (!insertedHubsMap.has(hubSlug)) {
      console.log(`📦 Inserting Hub Content: ${hubName}`);
      const [hubRow] = await db.insert(hubs).values({
        name: hubName, slug: hubSlug, isActive: true
      }).returning();
      insertedHubsMap.set(hubSlug, hubRow.id);
    }
    const hubId = insertedHubsMap.get(hubSlug)!;

    if (!hubNode.children) continue;

    for (const sectionNode of hubNode.children) {
      const sectionName = sectionNode.title;
      const sectionSlug = slugify(sectionName);
      const sectionKey = `${hubId}-${sectionSlug}`;

      if (!insertedSectionsMap.has(sectionKey)) {
        console.log(`  📂 Inserting Section Content: ${sectionName}`);
        const [secRow] = await db.insert(sections).values({
          hubId, name: sectionName, slug: sectionSlug, isActive: true
        }).returning();
        insertedSectionsMap.set(sectionKey, secRow.id);
      }
      const sectionId = insertedSectionsMap.get(sectionKey)!;

      if (!sectionNode.children) continue;

      for (const topicNode of sectionNode.children) {
        const topicName = topicNode.title;
        const topicSlug = slugify(topicName);
        const topicKey = `${sectionId}-${topicSlug}`;

        if (!insertedTopicsMap.has(topicKey)) {
          console.log(`    📋 Inserting Topic Content: ${topicName}`);
          const [topRow] = await db.insert(topics).values({
            sectionId, name: topicName, slug: topicSlug, isActive: true, isPublished: true
          }).returning();
          insertedTopicsMap.set(topicKey, topRow.id);
        }
        const topicId = insertedTopicsMap.get(topicKey)!;

        // Extract lessons under this topic
        const allLessons: any[] = [];
        function extractLessons(node: any) {
          if (node.url && node.children?.length === 0) {
            allLessons.push(node);
          } else if (node.children) {
            node.children.forEach(extractLessons);
          }
        }
        if (topicNode.children) {
           topicNode.children.forEach(extractLessons);
        }

        for (const lessonNode of allLessons) {
          const urlPath = lessonNode.url.replace(/\.html$/, ""); // the legacy path
          
          if (!insertedLessonsMap.has(urlPath)) {
            const htmlFilePath = path.join(SOURCE_DIR, lessonNode.url);
            let htmlContent = `<p>Content for ${lessonNode.title}</p>`;
            
            if (fs.existsSync(htmlFilePath)) {
              const rawHtml = fs.readFileSync(htmlFilePath, "utf-8");
              const $ = cheerio.load(rawHtml);
              let $body = $(".com-content-article__body");
              if ($body.length === 0) $body = $(".item-page");
              if ($body.length === 0) $body = $("article");
              $body.find(".pager, .adsbygoogle, script, style, .mod-custom, .tck-article-details").remove();
              htmlContent = $body.html()?.trim() || htmlContent;
            }

            let type = "Support";
            if (lessonNode.title.toLowerCase().includes("exercice")) type = "Exercice";
            if (lessonNode.title.toLowerCase().includes("quizz")) type = "Quizz";

            try {
              const [lesRow] = await db.insert(lessons).values({
                topicId,
                title: lessonNode.title,
                urlPath,
                type,
                htmlContent,
                metadata: {},
                isActive: true,
                isPublished: true
              }).returning();
              insertedLessonsMap.set(urlPath, lesRow.id);
              console.log(`      📄 Inserted Lesson Content: ${lessonNode.title} (${urlPath})`);
            } catch (e) {
              console.error(`      ❌ Failed Lesson Insert: ${lessonNode.title}`, e);
            }
          }
        }
      }
    }
  }

  console.log("\n--- PHASE 2: NAVIGATION TREE (nav_nodes) ---");
  
  let hubPosition = 1;
  for (const hubNode of rootChildren) {
    const hubName = hubNode.title;
    const hubSlug = hubNode.url ? hubNode.url.replace(/\.html$/, "") : slugify(hubName);
    const hubId = insertedHubsMap.get(hubSlug)!;

    console.log(`🔗 Nav Hub: ${hubName}`);
    const [navHub] = await db.insert(navNodes).values({
      parentId: null,
      title: hubName,
      slug: hubSlug,
      position: hubPosition++,
      hubId,
      isActive: true
    }).returning();

    if (!hubNode.children) continue;

    let secPosition = 1;
    for (const sectionNode of hubNode.children) {
      const sectionName = sectionNode.title;
      const sectionSlug = slugify(sectionName);
      const sectionKey = `${hubId}-${sectionSlug}`;
      const sectionId = insertedSectionsMap.get(sectionKey)!;

      const [navSec] = await db.insert(navNodes).values({
        parentId: navHub.id,
        title: sectionName,
        slug: sectionSlug,
        position: secPosition++,
        sectionId,
        isActive: true
      }).returning();

      if (!sectionNode.children) continue;

      let topPosition = 1;
      for (const topicNode of sectionNode.children) {
        const topicName = topicNode.title;
        const topicSlug = slugify(topicName);
        const topicKey = `${sectionId}-${topicSlug}`;
        const topicId = insertedTopicsMap.get(topicKey)!;

        const [navTop] = await db.insert(navNodes).values({
          parentId: navSec.id,
          title: topicName,
          slug: topicSlug,
          position: topPosition++,
          topicId,
          isActive: true
        }).returning();

        // Extract lessons for nav
        const allLessons: any[] = [];
        function extractLessonsForNav(node: any) {
          if (node.url && node.children?.length === 0) {
            allLessons.push(node);
          } else if (node.children) {
            node.children.forEach(extractLessonsForNav);
          }
        }
        if (topicNode.children) {
           topicNode.children.forEach(extractLessonsForNav);
        }

        let lesPosition = 1;
        for (const lessonNode of allLessons) {
          const urlPath = lessonNode.url.replace(/\.html$/, "");
          const lessonId = insertedLessonsMap.get(urlPath);
          
          if (lessonId) {
            const lessonSlug = slugify(lessonNode.title);
            await db.insert(navNodes).values({
              parentId: navTop.id,
              title: lessonNode.title,
              slug: lessonSlug,
              position: lesPosition++,
              lessonId,
              isActive: true
            });
          }
        }
      }
    }
  }

  console.log("\n🏁 Migration Finished!");
}

runMigration().catch(console.error);

