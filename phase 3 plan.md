# Phase 3: Data Extraction & Object Storage Migration (Refined)

This phase involves automating the extraction of content from the legacy HTML files, migrating media to modern Object Storage, and populating the new PostgreSQL database.

### 1. Install Migration Dependencies

Run the following command in your `clic-formation` directory.

```bash
npm install cheerio glob @aws-sdk/client-s3 mime-types dotenv
```

### 2. Configure Environment Variables

Update your `.env` with the source path and storage credentials.

```env
# Path to your local HTML source
LEGACY_HTML_PATH="C:\Users\ilias\Desktop\New folder (4)\office web\old version\webOffice\www.clic-formation.net"

# S3 / Object Storage (Optional for local testing)
S3_ENDPOINT=https://your-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=clic-formation-assets
S3_PUBLIC_URL=https://pub-your-id.r2.dev
```

### 3. The Migration Script

**File:** `scripts/migrate-data.ts`

```typescript
import fs from "fs";
import path from "path";
import { glob } from "glob";
import * as cheerio from "cheerio";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { db } from "../db";
import { lessons, categories } from "../db/schema";
import "dotenv/config";

const SOURCE_DIR = process.env.LEGACY_HTML_PATH || "";

if (!SOURCE_DIR || !fs.existsSync(SOURCE_DIR)) {
  console.error("❌ LEGACY_HTML_PATH is not defined or does not exist");
  process.exit(1);
}

const hasS3Config = process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID;
const s3 = hasS3Config ? new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
}) : null;

async function uploadToS3(localPath: string): Promise<string | null> {
  try {
    if (!fs.existsSync(localPath)) return null;
    if (!s3) return `/local-fallback/${path.basename(localPath)}`;

    const fileBuffer = fs.readFileSync(localPath);
    const fileName = `assets/${Date.now()}-${path.basename(localPath)}`;
    const contentType = mime.lookup(localPath) || "application/octet-stream";

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    }));

    return `${process.env.S3_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error);
    return null;
  }
}

async function runMigration() {
  console.log("🚀 Starting Data Migration...");
  const [defaultCategory] = await db.insert(categories).values({
    name: "General", slug: "general", description: "Migrated content",
  }).onConflictDoNothing().returning();
  const categoryId = defaultCategory?.id || 1;

  const files = await glob("**/*.html", { cwd: SOURCE_DIR, ignore: ["index.html", "component/**", "media/**", "templates/**"] });

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const html = fs.readFileSync(filePath, "utf-8");
    const $ = cheerio.load(html);

    const title = $(".page-header h1").text().trim() || $("h1").first().text().trim() || $("title").text().trim();
    const slug = path.basename(file, ".html");

    let $body = $(".com-content-article__body");
    if ($body.length === 0) $body = $(".item-page");
    if ($body.length === 0) $body = $("article");
    $body.find(".pager, .adsbygoogle, script, style, .mod-custom").remove();

    const imagePublicUrls: string[] = [];
    for (const img of $body.find("img").toArray()) {
      const src = $(img).attr("src");
      if (src && !src.startsWith("http")) {
        const localImgPath = path.resolve(path.dirname(filePath), src);
        const publicUrl = await uploadToS3(localImgPath);
        if (publicUrl) {
          $(img).attr("src", publicUrl);
          $(img).removeAttr("srcset");
          imagePublicUrls.push(publicUrl);
        }
      }
    }

    const cleanHtml = $body.html()?.trim() || "";
    if (!title || !cleanHtml) continue;

    await db.insert(lessons).values({
      title, slug, categoryId, htmlContent: cleanHtml, imageUrls: imagePublicUrls, orderIndex: 0,
    }).onConflictDoUpdate({ target: lessons.slug, set: { htmlContent: cleanHtml, imageUrls: imagePublicUrls } });
    console.log(`✅ Migrated: ${title}`);
  }
  console.log("🏁 Migration Finished!");
}

runMigration().catch(console.error);
```

### 4. Running the Migration

```bash
npx tsx scripts/migrate-data.ts
```
