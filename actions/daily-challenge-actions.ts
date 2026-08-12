"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DAILY_XP_BONUS = 50;

function getPeruDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Lima" }); // "YYYY-MM-DD"
}

/**
 * Selecciona la pregunta del día de forma determinista:
 * usa la fecha como semilla para que todos los usuarios vean la misma pregunta.
 */
async function selectDailyChallenge(todayStr: string) {
  // Traer solo SELECT challenges que tengan referenceText en su lección
  const challenges = await prisma.challenge.findMany({
    where: {
      type: "SELECT",
      lesson: { referenceText: { not: null } },
    },
    include: {
      challengeOptions: true,
      lesson: { select: { title: true, referenceText: true } },
    },
    orderBy: { id: "asc" },
  });

  if (challenges.length === 0) return null;

  // Semilla basada en la fecha (YYYYMMDD como número)
  const seed = parseInt(todayStr.replace(/-/g, ""), 10);
  const index = seed % challenges.length;
  return challenges[index];
}

export async function getDailyChallenge() {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  const today = getPeruDateString(new Date());

  // Verificar si ya respondió hoy
  const existing = await prisma.dailyChallengeClaim.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  const challenge = await selectDailyChallenge(today);
  if (!challenge) return { error: "No hay preguntas disponibles aún. ¡Vuelve pronto!" };

  // No revelar la respuesta correcta si aún no ha respondido
  const safeOptions = challenge.challengeOptions.map((o) => ({
    id: o.id,
    text: o.text,
    // Solo revela isCorrect si ya respondió
    isCorrect: existing ? o.correct : undefined,
  }));

  return {
    success: true,
    alreadyClaimed: !!existing,
    claimResult: existing
      ? { correct: existing.correct, xpEarned: existing.xpEarned }
      : null,
    challenge: {
      id: challenge.id,
      question: challenge.question,
      referenceText: challenge.lesson.referenceText,
      lessonTitle: challenge.lesson.title,
      options: safeOptions,
    },
    date: today,
    xpBonus: DAILY_XP_BONUS,
  };
}

export async function submitDailyChallenge(challengeId: number, selectedOptionId: number) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  const today = getPeruDateString(new Date());

  // Prevenir doble respuesta
  const existing = await prisma.dailyChallengeClaim.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (existing) return { error: "Ya completaste el reto de hoy. ¡Vuelve mañana!" };

  // Verificar que es la pregunta correcta del día
  const challenge = await selectDailyChallenge(today);
  if (!challenge || challenge.id !== challengeId) {
    return { error: "Pregunta inválida para hoy." };
  }

  const selectedOption = challenge.challengeOptions.find((o) => o.id === selectedOptionId);
  if (!selectedOption) return { error: "Opción no encontrada." };

  const correct = selectedOption.correct;
  const xpEarned = correct ? DAILY_XP_BONUS : 0;

  // Guardar el reclamo y actualizar XP en una sola transacción
  await prisma.$transaction(async (tx) => {
    await tx.dailyChallengeClaim.create({
      data: { userId, date: today, challengeId, correct, xpEarned },
    });

    if (xpEarned > 0) {
      await tx.userProgress.update({
        where: { userId },
        data: {
          points: { increment: xpEarned },
          weeklyPoints: { increment: xpEarned },
        },
      });
    }
  });

  revalidatePath("/learn");

  const correctOption = challenge.challengeOptions.find((o) => o.correct);
  return {
    success: true,
    correct,
    xpEarned,
    correctOptionId: correctOption?.id,
    correctOptionText: correctOption?.text,
  };
}
