"use server";

import { db } from "@/db";
import { userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import * as jose from "jose";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function completeLesson(lessonId: number) {
  const userId = await getUserIdFromToken();
  if (!userId) return { error: "Non autorisé" };

  await db
    .insert(userProgress)
    .values({
      userId,
      lessonId,
      status: "completed",
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.lessonId],
      set: { status: "completed", lastAccessedAt: new Date() },
    });

  return { success: true };
}

export async function saveQuizScore(lessonId: number, score: number) {
  const userId = await getUserIdFromToken();
  if (!userId) return { error: "Non autorisé" };

  await db
    .insert(userProgress)
    .values({
      userId,
      lessonId,
      quizScore: score,
      status: "completed",
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.lessonId],
      set: { 
        quizScore: score, 
        status: "completed", 
        lastAccessedAt: new Date() 
      },
    });

  return { success: true };
}
