import "dotenv/config";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";

// ── Config ──────────────────────────────────────────────────────
const LEGACY_IMAGES_DIR = path.join(
  process.env.LEGACY_HTML_PATH || "",
  "images"
);

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET || "clic-formation";

// ── Helpers ─────────────────────────────────────────────────────
function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Starting image upload to Cloudflare R2...");
  console.log(`📂 Source: ${LEGACY_IMAGES_DIR}`);
  console.log(`☁️  Bucket: ${BUCKET}`);
  console.log(`🔗 Endpoint: ${process.env.S3_ENDPOINT}`);
  console.log("");

  if (!fs.existsSync(LEGACY_IMAGES_DIR)) {
    console.error(`❌ Source directory not found: ${LEGACY_IMAGES_DIR}`);
    process.exit(1);
  }

  const allFiles = walkDir(LEGACY_IMAGES_DIR);
  const imageExts = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico"]);
  const imageFiles = allFiles.filter(f => imageExts.has(path.extname(f).toLowerCase()));

  console.log(`📊 Found ${imageFiles.length} image files to upload\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i];
    // Key = "images/01-excel/..." (preserving directory structure)
    const relativePath = path.relative(path.dirname(LEGACY_IMAGES_DIR), filePath);
    const key = relativePath.replace(/\\/g, "/"); // Windows path fix

    const contentType = mime.lookup(filePath) || "application/octet-stream";

    // Check if already uploaded (idempotent)
    if (await objectExists(key)) {
      skipped++;
      if (skipped % 50 === 0) {
        console.log(`  ⏭️  Skipped ${skipped} already-uploaded files...`);
      }
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable", // 1 year cache
        })
      );
      uploaded++;

      if (uploaded % 25 === 0 || uploaded === 1) {
        const pct = (((uploaded + skipped) / imageFiles.length) * 100).toFixed(1);
        console.log(`  ✅ ${uploaded} uploaded | ${pct}% done | latest: ${key}`);
      }
    } catch (err: any) {
      failed++;
      console.error(`  ❌ FAILED: ${key} — ${err.message}`);
    }
  }

  console.log("\n════════════════════════════════════════");
  console.log(`🏁 Upload Complete!`);
  console.log(`   ✅ Uploaded: ${uploaded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed:   ${failed}`);
  console.log(`   📊 Total:    ${imageFiles.length}`);
  console.log("════════════════════════════════════════\n");

  if (failed > 0) {
    console.log("⚠️  Some files failed. Re-run this script to retry (it skips existing files).");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
