import { db } from "../db";
import { lessons, navNodes } from "../db/schema";
import { isNotNull } from "drizzle-orm";

async function main() {
  console.log("Checking lessons urlPath...");
  const sampleLessons = await db.select().from(lessons).limit(5);
  console.log(sampleLessons.map(l => l.urlPath));

  console.log("Checking navNodes depth...");
  const nodesWithLessons = await db.query.navNodes.findMany({
    where: isNotNull(navNodes.lessonId),
    with: {
      parent: {
        with: {
          parent: {
            with: {
              parent: {
                with: {
                  parent: true
                }
              }
            }
          }
        }
      }
    },
    limit: 5
  });

  nodesWithLessons.forEach(n => {
    let depth = 0;
    let curr: any = n;
    while(curr) {
      depth++;
      curr = curr.parent;
    }
    console.log(`Node ${n.id} depth: ${depth}`);
  });
  
  process.exit(0);
}
main().catch(console.error);
