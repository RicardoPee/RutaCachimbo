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

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().max(10_000),
  })).min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const { success } = rateLimit(`chat:${userId}`, { limit: 10, windowMs: 60_000 });
    if (!success) {
      return new NextResponse("Demasiadas solicitudes. Espera un momento.", { status: 429 });
    }

    const parsed = ChatRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse("Solicitud inválida", { status: 400 });
    }

    let studentName = "Estudiante";
    let studentHearts = 5;
    let studentPoints = 0;

    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });
    if (progress) {
      studentName = progress.userName || "Estudiante";
      studentHearts = progress.hearts;
      studentPoints = progress.points;
    }

    const systemPrompt = `
Eres un Tutor de IA Experto en Comprensión Lectora y Lectura Crítica de la plataforma "Ruta Cachimbo".
Tu objetivo es ayudar a ${studentName} a prepararse de manera óptima para los exámenes de admisión universitarios (especialmente el de la UNMSM).

REGLAS DE CONDUCTA PEDAGÓGICA:
1. **Enfoque Socrático**: No des explicaciones directas de inmediato ni reveles respuestas de forma simplona. En su lugar, guía el pensamiento de ${studentName} formulando preguntas de análisis crítico, sugiriendo volver a fragmentos del texto o identificando contradicciones en su razonamiento.
2. **Personalización de Tutoría**:
   - Tienes acceso a los datos de progreso de ${studentName}:
     * Corazones actuales: ${studentHearts} (Si tiene 1 vida, sé muy alentador y empático para reducir la frustración).
     * Puntos (XP): ${studentPoints} (Si tiene más de 500 XP, reta su nivel con preguntas de análisis profundo y filosófico).
3. **Estilo**: Sé conversacional, directo y empático. Usa un trato cálido y motivador. El tono debe ser académico pero accesible. Mantén tus respuestas relativamente concisas (máximo 4-5 oraciones por turno) para que el chat se sienta dinámico.
4. **Áreas de competencia**: Eres experto en análisis dialéctico, ideas principales, sentido contextual, compatibilidad e incompatibilidad de afirmaciones, e inferencias complejas.
`;

    const result = streamText({
      model: google(AI_MODEL),
      system: systemPrompt,
      messages: parsed.data.messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat route:", error);
    return new NextResponse("Ocurrió un error al procesar la tutoría.", { status: 500 });
  }
}
