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

    const { lessonId } = await req.json();

    if (!lessonId) {
      return new NextResponse("Missing lessonId", { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
      include: {
        challenges: {
          include: { challengeOptions: true }
        }
      }
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // Si la lección ya tiene texto, devolverlo directamente
    if (lesson.referenceText && lesson.referenceText.trim().length > 30) {
      return NextResponse.json({ referenceText: lesson.referenceText });
    }

    // Si no tiene preguntas, no se puede sintetizar
    if (!lesson.challenges || lesson.challenges.length === 0) {
      return NextResponse.json({ referenceText: null });
    }

    // Sintetizar texto de lectura basado en el banco de preguntas de la lección
    const questionsSummary = lesson.challenges.map((c, i) => {
      const opts = c.challengeOptions.map(o => o.text).join(" / ");
      return `Pregunta ${i + 1}: ${c.question}\nOpciones: ${opts}`;
    }).join("\n\n");

    const prompt = `Actúa como un profesor universitario experto en Comprensión Lectora.
Genera un texto de lectura fluido y bien estructurado (aproximadamente 250-350 palabras) en español que contenga exactamente la información requerida para responder las siguientes preguntas de examen:

${questionsSummary}

Instrucciones:
- El texto debe estar organizado en 2 o 3 párrafos claros.
- Debe tener un estilo académico y divulgativo.
- Debe dar sustento directo a las respuestas correctas de las preguntas anteriores.`;

    const { text } = await generateText({
      model: google(AI_MODEL),
      prompt,
    });

    const generatedPassage = text ? text.trim() : null;

    if (generatedPassage) {
      // Guardar en base de datos para que la lección nunca más vuelva a estar sin texto
      await prisma.lesson.update({
        where: { id: Number(lessonId) },
        data: { referenceText: generatedPassage }
      });
    }

    return NextResponse.json({ referenceText: generatedPassage });
  } catch (error) {
    console.error("[SYNTHESIZE_PASSAGE_ERROR]", error);
    return new NextResponse("Error sintetizando pasaje de lectura", { status: 500 });
  }
}
