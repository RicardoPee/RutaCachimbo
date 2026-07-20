import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { success } = rateLimit(`coach:${userId}`, { limit: 15, windowMs: 60_000 });
    if (!success) {
      return new NextResponse("Demasiadas solicitudes. Espera un momento.", { status: 429 });
    }

    const { messages, question, selectedOption, correctOption, referenceText } = await req.json();

    if (!messages || !question || !selectedOption || !correctOption) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    let studentName = "Estudiante";
    let studentPoints = 0;

    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });
    if (progress) {
      studentName = progress.userName || "Estudiante";
      studentPoints = progress.points;
    }

    const systemPrompt = `
Eres el Coach de Comprensión Lectora de la plataforma "Ruta Cachimbo". Tu rol es guiar al estudiante de forma socrática.
El alumno se equivocó en el siguiente ejercicio:
- Pregunta: "${question}"
- Opción que seleccionó (Incorrecta): "${selectedOption}"
- Opción correcta: "${correctOption}"

TEXTO DE REFERENCIA:
"""
${referenceText || "(sin texto de referencia)"}
"""

REGLAS DE ORO DE CONDUCTA:
1. NUNCA reveles la respuesta correcta directamente ni des explicaciones conclusivas inmediatas. Deja que el alumno analice.
2. Si el alumno tiene dudas sobre por qué su opción seleccionada está mal, explícale en qué falló su lógica de forma socrática, retándolo a buscar la justificación en el texto.
3. Sé directo, empático y alentador. Dirígete a él como ${studentName}.
4. Mantén tus respuestas en un tamaño de chat (máximo 2 párrafos cortos).
`;

    // Convert messages into a prompt flow or pass them directly to streamText
    const result = await streamText({
      model: google('models/gemini-1.5-flash-latest'),
      system: systemPrompt,
      messages: messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[COACH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

