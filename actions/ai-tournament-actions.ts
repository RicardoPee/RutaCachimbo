"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { isAdminId } from "@/lib/admin";

// Initialize Google AI with the env key
// The @ai-sdk/google automatically uses GOOGLE_GENERATIVE_AI_API_KEY from environment

export const generateTournamentDraft = async (title: string, description: string, count: number) => {
    const { userId } = auth();
  if (!isAdminId(userId)) return { error: "No autorizado" };

  try {
    // 1. Fetch all available readings with their questions
    const allLessons = await prisma.lesson.findMany({
      where: {
        referenceText: { not: null },
        challenges: { some: { type: "SELECT" } }
      },
      include: {
        challenges: {
          where: { type: "SELECT" },
          include: { challengeOptions: true }
        }
      }
    });

    if (allLessons.length === 0) {
      return { error: "No hay lecturas disponibles en la base de datos." };
    }

    if (allLessons.length <= count) {
       // If DB has less than requested, just return all of them
       return { success: true, draft: allLessons };
    }

    // 2. Map data for AI
    const catalog = allLessons.map(l => ({
      id: l.id,
      title: l.title,
      previewText: l.referenceText?.substring(0, 150) + "..." // Shortened to save tokens
    }));

    // 3. Ask Gemini to pick the best matches
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        selectedIds: z.array(z.number()).describe(`Array of exactly ${count} lesson IDs selected for the tournament.`),
        reasoning: z.string().describe("Breve explicación de por qué elegiste estas lecturas para este torneo.")
      }),
      prompt: `
        Eres el Director Académico de un torneo llamado "${title}".
        Descripción del torneo: "${description}".
        
        A continuación tienes un catálogo de lecturas disponibles en JSON. 
        Analiza el contexto del torneo y selecciona las ${count} lecturas que mejor se adapten temática o académicamente.
        
        Catálogo:
        ${JSON.stringify(catalog, null, 2)}
      `
    });

    // 4. Retrieve the full objects from DB
    const selectedLessons = allLessons.filter(l => object.selectedIds.includes(l.id));

    // Fallback if AI messes up the count
    while (selectedLessons.length < count) {
      const randomFallback = allLessons.find(l => !selectedLessons.some(sl => sl.id === l.id));
      if (randomFallback) selectedLessons.push(randomFallback);
      else break;
    }

    return { 
      success: true, 
      draft: selectedLessons,
      aiReasoning: object.reasoning 
    };

  } catch (error: any) {
    console.error("AI Draft Error:", error);
    return { error: "Hubo un fallo de conexión con la IA. Asegúrate de tener conexión y la API Key válida." };
  }
};

export const getReplacementLesson = async (currentDraftIds: number[], title: string, description: string) => {
    const { userId } = auth();
  if (!isAdminId(userId)) return null;

  const allLessons = await prisma.lesson.findMany({
    where: {
      referenceText: { not: null },
      challenges: { some: { type: "SELECT" } },
      id: { notIn: currentDraftIds } // Don't pick ones already in draft
    },
    include: {
      challenges: {
        where: { type: "SELECT" },
        include: { challengeOptions: true }
      }
    }
  });

  if (allLessons.length === 0) return null;

  // For speed in re-rolling, we can just do a random pick or a quick AI pick. 
  // Doing a random pick from remaining pool is faster and saves tokens on a simple "swap" action.
  const randomIndex = Math.floor(Math.random() * allLessons.length);
  return allLessons[randomIndex];
};
