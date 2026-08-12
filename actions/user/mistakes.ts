"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

    await prisma.mistakeLog.create({
      data: {
        userId,
        context,
        questionText: cleanQuestion,
        wrongAnswerText: cleanWrong,
        correctAnswerText: cleanCorrect,
      },
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

    const logs = await prisma.mistakeLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { data: logs };
  } catch (error) {
    console.error("Error fetching mistakes:", error);
    return { error: "Failed to fetch mistakes" };
  }
};
