"use server";

import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { mistakeLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const logMistake = async (
  context: "LESSON" | "PVP" | "MOCK_EXAM",
  questionText: string,
  wrongAnswerText: string,
  correctAnswerText?: string | null
) => {
  try {
    const { userId } = auth();
    if (!userId) return { error: "Unauthorized" };

    // Prevent storing insanely long texts
    const cleanQuestion = questionText.substring(0, 1000);
    const cleanWrong = wrongAnswerText.substring(0, 500);
    const cleanCorrect = correctAnswerText ? correctAnswerText.substring(0, 500) : null;

    await db.insert(mistakeLogs).values({
      userId,
      context,
      questionText: cleanQuestion,
      wrongAnswerText: cleanWrong,
      correctAnswerText: cleanCorrect,
    });

    return { success: true };
  } catch (error) {
    console.error("Error logging mistake:", error);
    return { error: "Failed to log mistake" };
  }
};

export const getUserMistakes = async (limit: number = 5) => {
  try {
    const { userId } = auth();
    if (!userId) return { error: "Unauthorized" };

    const logs = await db.query.mistakeLogs.findMany({
      where: eq(mistakeLogs.userId, userId),
      orderBy: [desc(mistakeLogs.createdAt)],
      limit,
    });

    return { data: logs };
  } catch (error) {
    console.error("Error fetching mistakes:", error);
    return { error: "Failed to fetch mistakes" };
  }
};
