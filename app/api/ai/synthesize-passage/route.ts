import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AI_MODEL } from "@/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lessonId, questionText, context } = await req.json();

    // Opción 1: Sintetizar/Recuperar para una lección entera por ID
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: Number(lessonId) },
        include: {
          challenges: {
            include: { challengeOptions: true }
          }
        }
      });

      if (lesson) {
        if (lesson.referenceText && lesson.referenceText.trim().length > 30) {
          return NextResponse.json({ referenceText: lesson.referenceText });
        }

        if (lesson.challenges && lesson.challenges.length > 0) {
          const questionsSummary = lesson.challenges.map((c, i) => {
            const opts = c.challengeOptions.map(o => o.text).join(" / ");
            return `Pregunta ${i + 1}: ${c.question}\nOpciones: ${opts}`;
          }).join("\n\n");

          const prompt = `Actúa como un profesor universitario experto en Comprensión Lectora.
Genera un texto de lectura fluido y bien estructurado (aproximadamente 250-350 palabras) en español que contenga la información requerida para responder estas preguntas de examen:

${questionsSummary}

Instrucciones:
- El texto debe estar organizado en 2 o 3 párrafos claros.
- Debe tener un estilo académico y divulgativo.
- Debe dar sustento directo a las respuestas correctas.`;

          const { text } = await generateText({
            model: google(AI_MODEL),
            prompt,
          });

          const generatedPassage = text ? text.trim() : null;

          if (generatedPassage) {
            await prisma.lesson.update({
              where: { id: Number(lessonId) },
              data: { referenceText: generatedPassage }
            });
          }

          return NextResponse.json({ referenceText: generatedPassage });
        }
      }
    }

    // Opción 2: Sintetizar lectura de referencia para una pregunta específica de MistakeLog
    if (questionText) {
      const prompt = `Actúa como un catedrático universitario de examen de admisión.
Genera un pasaje de lectura académico y riguroso (aproximadamente 200-300 palabras) en español que sirva como texto de lectura y contexto para la siguiente pregunta:

Contexto/Tema: ${context || "Comprensión Lectora"}
Pregunta: "${questionText}"

Instrucciones:
- Escribe 2 o 3 párrafos académicos estructurados y bien redactados.
- El texto debe desarrollar el tema de la pregunta y dar soporte a la respuesta.`;

      const { text } = await generateText({
        model: google(AI_MODEL),
        prompt,
      });

      return NextResponse.json({ referenceText: text ? text.trim() : null });
    }

    return new NextResponse("Faltan parámetros de consulta", { status: 400 });
  } catch (error) {
    console.error("[SYNTHESIZE_PASSAGE_ERROR]", error);
    return new NextResponse("Error sintetizando pasaje de lectura", { status: 500 });
  }
}
