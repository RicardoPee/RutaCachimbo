"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { logMistake } from "@/actions/mistakes";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { getUserProgress } from "@/db/queries";
import { eq } from "drizzle-orm";
import { calculateNewStreak } from "@/lib/streak";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function generateMockExamWithAI(universityId?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Actúa como un catedrático experto en elaboración de exámenes de admisión para universidades prestigiosas (estilo DECO - Destrezas Cognitivas).
Genera exactamente 10 preguntas de opción múltiple de alto nivel (Historia, Geografía, Literatura, Matemáticas, Ciencias, etc.).
Cada pregunta debe tener un texto de referencia (contexto, problema o lectura) y 4 alternativas.

Retorna SOLO un arreglo JSON estricto con el siguiente formato, sin markdown extra:
[
  {
    "referenceText": "Texto de lectura o contexto del problema...",
    "question": "Pregunta específica sobre el texto...",
    "difficulty": "Difícil",
    "options": [
      { "text": "Alternativa A", "correct": true },
      { "text": "Alternativa B", "correct": false },
      { "text": "Alternativa C", "correct": false },
      { "text": "Alternativa D", "correct": false }
    ]
  }
]`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
      })
    });

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);

    let fakeIdCounter = 90000;
    const questions = parsed.map((item: any) => {
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
        challengeOptions: shuffledOptions.map((opt: any) => ({
          id: fakeIdCounter++,
          challengeId: qId,
          text: opt.text,
          correct: opt.correct,
          imageSrc: null,
          audioSrc: null
        }))
      };
    });

    return questions;
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
                  include: { challengeOptions: true }
                }
              }
            }
          }
        }
      }
    });

    // if (!globalCourse) return { error: "No hay simulacros disponibles. Pide al administrador que suba PDFs." }; // Reemplazado por fallback IA

    let allChallenges: any[] = [];
    if (globalCourse) {
      globalCourse.units.forEach(unit => {
        unit.lessons.forEach(lesson => {
          lesson.challenges.forEach(challenge => {
            allChallenges.push({
              ...challenge,
              referenceText: lesson.referenceText,
              lessonTitle: lesson.title,
              difficulty: unit.title
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
          correctAnswer: correctOption?.text
        });
        
        // Log the mistake for the AI Tutor seamlessly
        await logMistake("MOCK_EXAM", q.question, wrongAnswerText, correctOption?.text);
      }
    }

    // Puntuación estilo UNMSM: +20 correcta, -1.125 incorrecta, 0 en blanco
    let score = (correct * 20) - (incorrect * 1.125);
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
        aiFeedback
      }
    });

    const currentUserProgress = await getUserProgress();
    if (currentUserProgress) {
      const { newStreak, usedFreeze, newLastActive } = calculateNewStreak(
        currentUserProgress.streak, 
        currentUserProgress.lastActive, 
        currentUserProgress.streakFreeze
      );
      await db.update(userProgress).set({
        points: currentUserProgress.points + 20,
        weeklyPoints: currentUserProgress.weeklyPoints + 20,
        streak: newStreak,
        lastActive: newLastActive,
        ...(usedFreeze ? { streakFreeze: false } : {})
      }).where(eq(userProgress.userId, userId));
    }

    revalidatePath("/simulacros");
    return { success: true, resultId: result.id };
  } catch (error: any) {
    console.error(error);
    return { error: "Error al calificar el simulacro." };
  }
}

async function generateAIFeedback(errors: any[], correct: number, incorrect: number, blank: number, universityId?: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return "Feedback IA no disponible (Falta API Key).";

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
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sigue practicando, vas por buen camino.";
  } catch (e) {
    return "Error al conectar con la IA para tu feedback.";
  }
}
