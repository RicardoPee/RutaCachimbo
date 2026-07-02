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

const TutorRequestSchema = z.object({
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

    const { success } = rateLimit(`tutor:${userId}`, { limit: 10, windowMs: 60_000 });
    if (!success) {
      return new NextResponse("Demasiadas solicitudes. Espera un momento.", { status: 429 });
    }

    const parsed = TutorRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse("Solicitud inválida", { status: 400 });
    }

    let studentName = "Estudiante";
    let studentHearts = 5;
    let studentLeague = "BRONCE";

    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });
    if (progress) {
      studentName = progress.userName || "Estudiante";
      studentHearts = progress.hearts;
      studentLeague = progress.league || "BRONCE";
    }

    let mistakesHistory = "";
    try {
      const logs = await prisma.mistakeLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      if (logs.length > 0) {
        mistakesHistory = "\nHISTORIAL DE ERRORES RECIENTES DEL ALUMNO (Úsalos para personalizar tu tutoría o plantearle retos similares):\n" +
          logs.map((log, i) => `Error ${i + 1} (${log.context}):\n- Pregunta fallada: "${log.questionText}"\n- Respuesta que marcó (incorrecta): "${log.wrongAnswerText}"\n- Respuesta real (correcta): "${log.correctAnswerText || 'N/A'}"`).join("\n\n");
      }
    } catch (e) { console.error("Could not fetch mistake logs", e); }

    let pedagogicalInstruction = "";
    if (studentLeague === "BRONCE" || studentLeague === "PLATA") {
      pedagogicalInstruction = "El estudiante está en un nivel inicial/intermedio. Sé muy paciente, explica las bases de la comprensión lectora desde cero. Usa ejemplos muy cotidianos y anímalo constantemente para que no se frustre.";
    } else {
      pedagogicalInstruction = "El estudiante está en la liga de ÉLITE (Oro/Diamante). Asume que ya domina las bases teóricas. Sé altamente exigente, usa jerga académica avanzada de exámenes de admisión y plantéale 'distractores' o preguntas trampa para llevar su capacidad crítica al límite filosófico.";
    }

    const systemPrompt = `
Eres un Tutor de IA Experto en Comprensión Lectora y Lectura Crítica de la plataforma "Ruta Cachimbo".
Tu objetivo es ayudar a ${studentName} a prepararse de manera óptima para los exámenes de admisión universitarios.

REGLAS DE CONDUCTA PEDAGÓGICA:
1. **Enfoque Socrático**: No des explicaciones directas de inmediato ni reveles respuestas de forma simplona. Guía el pensamiento de ${studentName} formulando preguntas de análisis crítico.
2. **Personalización de Tutoría (CRÍTICO)**:
   - Nivel Académico Actual: Liga ${studentLeague}.
   - Instrucción específica para este nivel: ${pedagogicalInstruction}
   - Corazones actuales: ${studentHearts} (Si tiene 1 vida, sé extremadamente alentador para reducir la frustración).
3. **Estilo**: Sé conversacional, directo y empático. Mantén tus respuestas concisas (máximo 4-5 oraciones por turno) para que el chat se sienta dinámico.
4. **Áreas de competencia**: Eres experto en análisis dialéctico, ideas principales, sentido contextual, inferencias complejas.
${mistakesHistory}
`;

    const result = streamText({
      model: google(AI_MODEL),
      system: systemPrompt,
      messages: parsed.data.messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in AI Tutor chat route:", error);
    return new NextResponse("Ocurrió un error al procesar la tutoría.", { status: 500 });
  }
}
