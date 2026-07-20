import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { AI_MODEL } from "@/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ExplainRequestSchema = z.object({
  referenceText: z.string().max(50_000).nullish(),
  question: z.string().max(5_000),
  selectedOptionText: z.string().max(5_000),
  isCorrect: z.boolean(),
  hearts: z.number().int().nullish(),
  optionId: z.number().int().nullish(),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const { success } = rateLimit(`explain:${userId}`, { limit: 30, windowMs: 60_000 });
    if (!success) {
      return new NextResponse("Demasiadas solicitudes. Espera un momento.", { status: 429 });
    }

    const parsed = ExplainRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse("Solicitud inválida", { status: 400 });
    }

    const { referenceText, question, selectedOptionText, isCorrect, hearts, optionId } = parsed.data;

    // NIVEL 1: Búsqueda en Caché de Base de Datos (0 Tokens API)
    let optionRecord = null;

    if (optionId) {
      optionRecord = await prisma.challengeOption.findUnique({
        where: { id: optionId },
      });
    } else {
      optionRecord = await prisma.challengeOption.findFirst({
        where: {
          text: selectedOptionText,
          challenge: { question },
        },
      });
    }

    // Si ya existe la explicación en la DB, responder instantáneamente (0 Tokens)
    if (optionRecord && optionRecord.explanation && optionRecord.explanation.trim().length > 0) {
      const cachedText = optionRecord.explanation;
      
      // Retornar en streaming de texto para compatibilidad de cliente
      return new Response(cachedText, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "X-Cache": "HIT",
        },
      });
    }

    // Si no está en caché, generar con IA utilizando Recorte de Contexto (NIVEL 3)
    let studentName = "Estudiante";
    let studentHearts = 5;

    const progress = await prisma.userProgress.findUnique({
      where: { userId },
      select: { userName: true, hearts: true, points: true },
    });
    if (progress) {
      studentName = progress.userName || "Estudiante";
      studentHearts = typeof hearts === "number" ? hearts : progress.hearts;
    }

    // Recorte de contexto: Max 300 caracteres del texto de referencia para minimizar tokens de entrada
    const trimmedContext = referenceText && referenceText.length > 300 
      ? referenceText.substring(0, 300) + "..."
      : referenceText || "(sin contexto adicional)";

    const systemPrompt = `
Eres un Tutor Experto en Comprensión Lectora de "Ruta Cachimbo".
Instrucciones estrictas para minimizar consumo:
1. NUNCA menciones la letra de la opción correcta ni digas "la respuesta correcta es X".
2. Si el alumno falló: Explica en máximo 2 oraciones breves y directas en qué consistió su error de lógica o mala interpretación.
3. Si el alumno acertó: Valida su razonamiento en 1-2 oraciones cortas.
4. Máximo 100 palabras. Sé conciso y dinámico. Dirígete amablemente a ${studentName}.
`;

    const userPrompt = `
Pregunta: "${question}"
Opción del estudiante: "${selectedOptionText}"
¿Es correcta?: ${isCorrect ? "SÍ" : "NO"}
Contexto: "${trimmedContext}"
`;

    const result = streamText({
      model: google(AI_MODEL),
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Guardar la respuesta generada en la DB de forma asíncrona para futuros alumnos (Caché Auto-guardado)
    if (optionRecord) {
      const optionToUpdateId = optionRecord.id;
      (async () => {
        try {
          const fullText = await result.text;
          if (fullText && fullText.trim()) {
            await prisma.challengeOption.update({
              where: { id: optionToUpdateId },
              data: { explanation: fullText.trim() },
            });
          }
        } catch (err) {
          console.error("Error al guardar caché de explicación:", err);
        }
      })();
    }

    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error in streaming explanation API:", error);
    return new NextResponse("Ocurrió un error al procesar la explicación del tutor.", { status: 500 });
  }
}
