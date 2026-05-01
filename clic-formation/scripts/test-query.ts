import "dotenv/config";
import { db } from "../db";
import { hubs } from "../db/schema";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("🚀 Testing query...");
    const dynamicHubs = await db.select().from(hubs).orderBy(hubs.name);
    console.log("✅ Query successful. Found hubs:", dynamicHubs.length);
  } catch (err: any) {
    console.error("❌ Query FAILED:");
    console.error(err.message);
    if (err.query) console.error("Query:", err.query);
  }
  process.exit(0);
}

main();
