"use server";

import { z } from "zod";
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { logMistake } from "@/actions/mistakes";
import { getUserProgress } from "@/db/queries";
import { calculateNewStreak } from "@/lib/streak";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import {
  AI_MODEL,
  POINTS_PER_MOCK_EXAM,
  MOCK_EXAM_POINTS_CORRECT,
  MOCK_EXAM_PENALTY_INCORRECT,
} from "@/constants";

const MockExamSchema = z.object({
  questions: z.array(z.object({
    referenceText: z.string().describe("Texto de lectura o contexto del problema."),
    question: z.string().describe("Pregunta específica sobre el texto."),
    difficulty: z.string().describe("Nivel de dificultad, ej. 'Difícil'."),
    options: z.array(z.object({
      text: z.string(),
      correct: z.boolean(),
    })).length(4).describe("Exactamente 4 alternativas, solo 1 correcta."),
  })).length(10),
});

async function generateMockExamWithAI(universityId?: string) {
  try {
    const { object } = await generateObject({
      model: google(AI_MODEL),
      schema: MockExamSchema,
      prompt: `Actúa como un catedrático experto en elaboración de exámenes de admisión para universidades prestigiosas (estilo DECO - Destrezas Cognitivas).
Genera exactamente 10 preguntas de opción múltiple de alto nivel (Historia, Geografía, Literatura, Matemáticas, Ciencias, etc.).
Cada pregunta debe tener un texto de referencia (contexto, problema o lectura) y 4 alternativas donde solo 1 es correcta.`,
    });

    let fakeIdCounter = 90000;
    return object.questions.map((item) => {
      const qId = fakeIdCounter++;
      // Shuffle options to prevent correct always being first if AI generated it that way
      const shuffledOptions = [...item.options].sort(() => 0.5 - Math.random());

      return {
        id: qId,
        question: item.question,
        type: "SELECT",
        referenceText: item.referenceText,
        lessonTitle: "Simulacro IA en Tiempo Real",
        difficulty: item.difficulty || "DECO Avanzado",
        challengeOptions: shuffledOptions.map((opt) => ({
          id: fakeIdCounter++,
          challengeId: qId,
          text: opt.text,
          correct: opt.correct,
          imageSrc: null,
          audioSrc: null,
        })),
      };
    });
  } catch (e) {
    console.error("Error generating mock exam:", e);
    return null;
  }
}

export async function getMockExamQuestions(universityId?: string) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const globalCourse = await prisma.course.findFirst({
      where: { title: "Simulacros Globales IA" },
      include: {
        units: {
          include: {
            lessons: {
              include: {
                challenges: {
                  include: { challengeOptions: true },
                },
              },
            },
          },
        },
      },
    });

    let allChallenges: any[] = [];
    if (globalCourse) {
      globalCourse.units.forEach((unit) => {
        unit.lessons.forEach((lesson) => {
          lesson.challenges.forEach((challenge) => {
            allChallenges.push({
              ...challenge,
              referenceText: lesson.referenceText,
              lessonTitle: lesson.title,
              difficulty: unit.title,
            });
          });
        });
      });
    }

    if (!globalCourse || allChallenges.length < 5) {
      const aiQuestions = await generateMockExamWithAI(universityId);
      if (aiQuestions && aiQuestions.length > 0) {
        return { success: true, questions: aiQuestions };
      }
      return { error: "No hay simulacros disponibles en la base de datos y la IA está ocupada." };
    }

    // Mezclar aleatoriamente y seleccionar hasta 20
    const shuffled = allChallenges.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20);

    return { success: true, questions: selected };
  } catch (error: any) {
    return { error: "Error al obtener las preguntas." };
  }
}

export async function submitMockExam(payload: { answers: Record<number, number | null>, timeSpent: number, questions: any[], universityId?: string }) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    let correct = 0;
    let incorrect = 0;
    let blank = 0;

    const { answers, timeSpent, questions, universityId } = payload;
    const feedbackContext: any[] = [];

    for (const q of questions) {
      const selectedOptionId = answers[q.id];
      const correctOption = q.challengeOptions.find((o: any) => o.correct);

      if (!selectedOptionId) {
        blank++;
      } else if (selectedOptionId === correctOption?.id) {
        correct++;
      } else {
        incorrect++;
        const wrongAnswerText = q.challengeOptions.find((o: any) => o.id === selectedOptionId)?.text || "";
        feedbackContext.push({
          question: q.question,
          difficulty: q.difficulty,
          wrongAnswer: wrongAnswerText,
          correctAnswer: correctOption?.text,
        });

        // Log the mistake for the AI Tutor seamlessly
        await logMistake("MOCK_EXAM", q.question, wrongAnswerText, correctOption?.text);
      }
    }

    // Puntuación estilo UNMSM: +20 correcta, -1.125 incorrecta, 0 en blanco
    let score = (correct * MOCK_EXAM_POINTS_CORRECT) - (incorrect * MOCK_EXAM_PENALTY_INCORRECT);
    if (score < 0) score = 0;

    let aiFeedback = "¡Excelente esfuerzo! Has completado el simulacro.";
    if (incorrect > 0 || blank > 0) {
      aiFeedback = await generateAIFeedback(feedbackContext, correct, incorrect, blank, universityId);
    }

    const result = await prisma.mockExamResult.create({
      data: {
        userId,
        score,
        correct,
        incorrect,
        blank,
        timeSpent,
        aiFeedback,
      },
    });

    const currentUserProgress = await getUserProgress();
    if (currentUserProgress) {
      const { newStreak, usedFreeze, newLastActive } = calculateNewStreak(
        currentUserProgress.streak,
        currentUserProgress.lastActive,
        currentUserProgress.streakFreeze
      );
      await prisma.userProgress.update({
        where: { userId },
        data: {
          points: currentUserProgress.points + POINTS_PER_MOCK_EXAM,
          weeklyPoints: currentUserProgress.weeklyPoints + POINTS_PER_MOCK_EXAM,
          streak: newStreak,
          lastActive: newLastActive,
          ...(usedFreeze ? { streakFreeze: false } : {}),
        },
      });

      const totalQuestions = correct + incorrect + blank;
      const scorePercent = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

      await checkAndUnlockAchievements(userId, {
        type: "exam",
        examScore: scorePercent,
        examTimeSpent: timeSpent,
        streakValue: newStreak
      });
    }

    revalidatePath("/simulacros");
    return { success: true, resultId: result.id };
  } catch (error: any) {
    console.error(error);
    return { error: "Error al calificar el simulacro." };
  }
}

async function generateAIFeedback(errors: any[], correct: number, incorrect: number, blank: number, universityId?: string) {
  let uniContext = "un examen de admisión universitario general";
  if (universityId?.includes("uni")) uniContext = "el examen de la UNI (altamente competitivo, donde las blancas no restan tanto pero requieren extrema velocidad)";
  if (universityId?.includes("sm")) uniContext = "el examen de San Marcos (Decano de América, enfocado en preguntas tipo DECO y análisis complejo)";
  if (universityId?.includes("pucp")) uniContext = "la PUCP (evalúa lógica impecable y lectura crítica profunda)";

  const prompt = `
Eres un Tutor Experto para ${uniContext}. Un alumno acaba de terminar un simulacro.
Resultados de esta sesión: ${correct} correctas, ${incorrect} incorrectas, ${blank} dejadas en blanco.

Aquí están algunas preguntas en las que se equivocó:
${JSON.stringify(errors.slice(0, 4), null, 2)}

Escribe un reporte de retroalimentación de 2 párrafos cortos (sin usar viñetas) hablando directamente con el alumno en un tono propio de un experto de ${uniContext}.
- Párrafo 1: Felicítalo por su valentía al practicar y resume su rendimiento de hoy.
- Párrafo 2: Analiza las preguntas en las que falló. Si dejó muchas en blanco, aconséjale sobre gestión de tiempo. Da un consejo accionable, empático y MUY enfocado al estilo de la universidad elegida.
`;

  try {
    const { text } = await generateText({
      model: google(AI_MODEL),
      prompt,
    });
    return text || "Sigue practicando, vas por buen camino.";
  } catch (e) {
    return "Error al conectar con la IA para tu feedback.";
  }
}
