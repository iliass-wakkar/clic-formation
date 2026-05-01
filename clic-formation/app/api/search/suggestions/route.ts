import { db } from "@/db";
import { lessons } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const searchTerm = `%${query}%`;

  try {
    const results = await db.query.lessons.findMany({
      where: or(
        ilike(lessons.title, searchTerm),
        ilike(lessons.urlPath, searchTerm)
      ),
      columns: {
        id: true,
        title: true,
        urlPath: true,
        type: true,
      },
      limit: 8,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
