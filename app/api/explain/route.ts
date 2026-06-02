import { NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    let studentName = "Estudiante";
    let studentHearts = 5;
    let studentPoints = 0;

    const { referenceText, question, selectedOptionText, isCorrect, hearts } = await req.json();

    if (userId) {
      const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
      });
      if (progress) {
        studentName = progress.userName || "Estudiante";
        studentHearts = typeof hearts === "number" ? hearts : progress.hearts;
        studentPoints = progress.points;
      }
    }

    const systemPrompt = `
Eres un Tutor Experto de nivel universitario en Comprensión Lectora y Lectura Crítica de la plataforma "Ruta Cachimbo". Tu rol es ser un guía cognitivo y socrático para el estudiante.

Tu objetivo principal es ayudar al estudiante a desarrollar sus habilidades de análisis literario, deducción e inferencia.

REGLAS DE ORO DE CONDUCTA (CRÍTICAS Y DE OBLIGADO CUMPLIMIENTO):
1. BAJO NINGUNA CIRCUNSTANCIA reveles cuál es la opción correcta, ni des la respuesta del ejercicio, ni uses expresiones como "la respuesta correcta es X", "deberías haber elegido Y" o "la opción indicada es Z". El estudiante DEBE descubrir la respuesta correcta por sí mismo.
2. Si el estudiante respondió INCORRECTAMENTE, debes:
   - Explicar detalladamente por qué la opción específica que él/ella seleccionó es incorrecta o en qué parte de su razonamiento falló (ej. confundió una afirmación particular con la idea principal, hizo una sobre-inferencia no sustentada por el texto, interpretó de forma demasiado literal una metáfora, etc.).
   - Guiar su atención hacia la parte clave del texto de referencia o formular una pregunta socrática/analítica para que vuelva a leer y reflexionar.
3. Si el estudiante respondió CORRECTAMENTE, debes:
   - Validar y celebrar su razonamiento de forma breve y académica.
   - Reforzar brevemente por qué esa deducción es correcta basándote en el texto, sin repetir de forma redundante u obvia la respuesta.
4. Sé conciso y directo (máximo 3-4 oraciones). Recuerda que es un formato de chat interactivo y dinámico.
5. Dirígete directamente a ${studentName} con un trato cálido y motivador.

LÓGICA PEDAGÓGICA (Aplica la estrategia adecuada según el estado del estudiante):
- Si el estudiante está en su ÚLTIMA VIDA (corazones/vidas actuales = 1) y falló: Sé sumamente comprensivo, empático y dale una "Pista Salvavidas" (una pista muy útil e indirecta sobre el texto) para evitar que se frustre o pierda su última vida, pero SIN revelarle el resultado final.
- Si el estudiante es AVANZADO (XP/puntos acumulados > 500) y falló: Adopta un enfoque socrático retador. Hazle una pregunta analítica que le obligue a cuestionar sus propias suposiciones y volver al texto con una mirada crítica.
- Para fallas en situaciones comunes: Explica de forma pedagógica, clara y amable en qué consistió el error en su lógica de selección.
`;

    const userPrompt = `
Datos del Estudiante:
- Nombre: ${studentName}
- Corazones restantes: ${studentHearts}
- Puntos de Experiencia (XP): ${studentPoints}

Texto de Referencia:
"""
${referenceText}
"""

Pregunta del Simulacro:
"${question}"

Opción que seleccionó el estudiante:
"${selectedOptionText}"

¿La respuesta seleccionada es correcta?: ${isCorrect ? "SÍ" : "NO"}

Genera tu respuesta socrática optimizada de tutoría cognitiva para ${studentName}:
`;

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in streaming explanation API:", error);
    return new NextResponse("Ocurrió un error al procesar la explicación del tutor.", { status: 500 });
  }
}
