"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

type VocabWordItem = {
  word: string;
  definition: string;
  context: string;
};

/**
 * Obtiene el vocabulario de una lección. Si no se ha generado aún,
 * llama a la API de Gemini para extraer palabras desafiantes en base al texto de referencia.
 */
export async function getVocabulary(lessonId: number) {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    // 1. Buscar en BD si ya existe vocabulario
    const existing = await prisma.vocabularyWord.findMany({
      where: { lessonId },
      orderBy: { id: "asc" },
    });

    if (existing.length > 0) {
      return { success: true, words: existing };
    }

    // 2. Si no existe, cargar la lección y extraer del referenceText
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { referenceText: true, title: true },
    });

    if (!lesson || !lesson.referenceText) {
      return { error: "El texto de referencia de la lección no está disponible." };
    }

    // 3. Llamar a Gemini con configuración de JSON estructurado
    const prompt = `Eres un profesor experto en preparación preuniversitaria de comprensión lectora.
Lee con atención el siguiente texto de la lectura titulada "${lesson.title}".
Tu objetivo es identificar exactamente entre 4 y 6 palabras académicas desafiantes o de nivel preuniversitario presentes en el texto.
Para cada palabra, debes proporcionar:
1. "word": la palabra o término exacto (en su forma base o conjugada tal como aparece).
2. "definition": la definición precisa, formal y clara en español aplicable a la comprensión del texto.
3. "context": la oración exacta del texto donde se utiliza la palabra.

Devuelve únicamente un arreglo JSON que cumpla con este formato:
[
  {
    "word": "palabra",
    "definition": "definición precisa en español",
    "context": "oración de contexto"
  }
]

Texto original:
${lesson.referenceText}`;

    let response;
    let errText = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(`${GEMINI_API_URL}?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) break;

      errText = await response.text();
      if ((response.status === 429 || response.status === 503) && attempt < 3) {
        await new Promise((res) => setTimeout(res, attempt * 10000));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      console.error("Gemini API error:", errText);
      return { error: "No se pudo contactar a la inteligencia artificial para extraer el vocabulario." };
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return { error: "La IA devolvió una respuesta vacía." };
    }

    let parsedWords: VocabWordItem[] = [];
    try {
      parsedWords = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing Gemini JSON:", responseText);
      return { error: "Error al interpretar el vocabulario generado por la IA." };
    }

    if (!Array.isArray(parsedWords) || parsedWords.length === 0) {
      return { error: "La IA no generó una lista válida de vocabulario." };
    }

    // 4. Guardar vocabulario en la BD
    const createdWords = await prisma.$transaction(
      parsedWords.map((item) =>
        prisma.vocabularyWord.create({
          data: {
            lessonId,
            word: item.word,
            definition: item.definition,
            context: item.context,
          },
        })
      )
    );

    revalidatePath("/learn");
    return { success: true, words: createdWords };
  } catch (error) {
    console.error("[GET_VOCABULARY_ERROR]", error);
    return { error: "Ocurrió un error inesperado al cargar el vocabulario." };
  }
}
