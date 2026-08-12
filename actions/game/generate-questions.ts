"use server";

import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { AI_MODEL } from "@/constants";

const QuestionSchema = z.object({
  questions: z.array(z.object({
    questionText: z.string().describe("La pregunta de comprensión lectora."),
    options: z.array(z.object({
      text: z.string().describe("El texto de la opción de respuesta."),
      isCorrect: z.boolean().describe("true si es la respuesta correcta, false de lo contrario."),
      explanation: z.string().describe("Breve explicación didáctica de máximo 2 oraciones para el estudiante. Si la opción es correcta, explica por qué lo es basándote en el texto. Si la opción es incorrecta, explica amable e indirectamente por qué no encaja, para que el estudiante pueda deducirlo."),
    })).length(4).describe("Debe generar exactamente 4 opciones, donde solo 1 es correcta."),
  })).length(3).describe("Exactamente 3 preguntas: 1 Literal, 1 Inferencial y 1 Crítica."),
});

export const generateQuestionsForLesson = async (lessonId: number) => {
  if (!isAdmin()) {
    throw new Error("Unauthorized");
  }

  const lessonData = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lessonData || !lessonData.referenceText) {
    return { error: "La lección no tiene un texto de lectura guardado." };
  }

  try {
    const { object } = await generateObject({
      model: google(AI_MODEL),
      schema: QuestionSchema,
      prompt: `Actúa como un tutor experto en preparación preuniversitaria para exámenes de admisión en Perú (ej. San Marcos, UNI).
Lee el siguiente texto y genera exactamente 3 preguntas de comprensión lectora.
- Pregunta 1: Nivel Literal.
- Pregunta 2: Nivel Inferencial.
- Pregunta 3: Nivel Crítico.
Para cada pregunta genera 4 opciones de respuesta, donde SOLO 1 es correcta.
Además, DEBES proporcionar una explicación pedagógica en español para CADA opción (sea correcta o incorrecta), que servirá de feedback inmediato para el alumno.

TEXTO DE REFERENCIA:
${lessonData.referenceText}`
    });

    for (let i = 0; i < object.questions.length; i++) {
      const q = object.questions[i];

      await prisma.challenge.create({
        data: {
          lessonId,
          type: "SELECT",
          question: q.questionText,
          order: i + 1,
          challengeOptions: {
            create: q.options.map((opt) => ({
              text: opt.text,
              correct: opt.isCorrect,
              explanation: opt.explanation,
            })),
          },
        },
      });
    }

    revalidatePath(`/lesson/${lessonId}`);
    revalidatePath("/learn");
    return { success: true };
  } catch (error) {
    console.error("Error generating questions:", error);
    return { error: "Failed to generate questions. Check API Key or try again." };
  }
};
