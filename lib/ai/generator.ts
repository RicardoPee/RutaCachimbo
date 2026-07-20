import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Tipo devuelto por la API de IA para las preguntas generadas
 */
export type GeneratedQuestion = {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
};

/**
 * Utiliza Gemini (o modelo configurado) para leer un texto y extraer preguntas tipo examen de admisión.
 */
export async function generateQuestionsFromText(
  referenceText: string,
  amount: number = 5
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `
Eres un creador experto de exámenes pre-universitarios (tipo UNMSM).
Basándote ESTRICTAMENTE en el siguiente texto, genera ${amount} preguntas de opción múltiple.
Cada pregunta debe evaluar diferentes habilidades (Inferencia, Idea Principal, Vocabulario en contexto, Incompatibilidad, etc).

Reglas:
1. Exactamente 4 opciones por pregunta.
2. Solo UNA opción debe ser correcta.
3. Las opciones incorrectas (distractores) deben ser plausibles pero definitivamente erróneas.
4. Explica brevemente por qué la correcta es la correcta (para usarse como feedback).

Texto de referencia:
"""
${referenceText}
"""

DEBES devolver ÚNICAMENTE un array JSON válido, con este formato exacto, sin markdown (\`\`\`json) ni texto adicional alrededor:
[
  {
    "question": "¿Cuál es la idea principal del texto?",
    "options": [
      { "text": "Opción 1", "isCorrect": false },
      { "text": "Opción correcta", "isCorrect": true },
      { "text": "Opción 3", "isCorrect": false },
      { "text": "Opción 4", "isCorrect": false }
    ],
    "explanation": "La opción correcta es la segunda porque el texto enfatiza..."
  }
]
`;

    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'),
      prompt,
      temperature: 0.2, // Low temperature for deterministic/factual questions
    });

    // Cleanup potential markdown blocks if the LLM ignores instructions
    let jsonString = text.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed: GeneratedQuestion[] = JSON.parse(jsonString);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("El modelo no retornó un array válido de preguntas.");
    }

    return parsed;
  } catch (error) {
    console.error("[GENERATE_QUESTIONS_ERROR]", error);
    throw new Error("Error procesando el documento con Inteligencia Artificial.");
  }
}

/**
 * Mode A: Banco de Plantillas.
 * Toma una pregunta plantilla con variables de sustitución y genera variantes conceptualmente idénticas.
 */
export async function generateQuestionVariations(
  questionTemplate: string,
  optionsTemplate: { text: string; correct: boolean }[],
  amount: number = 3
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `
Eres un experto pedagógico en diseño curricular.
Tu tarea es tomar la siguiente pregunta plantilla y sus opciones, y generar ${amount} variantes conceptualmente equivalentes pero escritas con diferentes palabras (ej. usando sinónimos, cambiando el foco sintáctico o el orden de ideas) de modo que midan exactamente el mismo conocimiento e indirectamente tengan la misma respuesta correcta.

Pregunta original:
"${questionTemplate}"

Opciones originales:
${optionsTemplate.map((o) => `- ${o.text} (Correcta: ${o.correct})`).join("\n")}

DEBES devolver ÚNICAMENTE un array JSON válido, con este formato exacto, sin markdown (\`\`\`json) ni texto adicional alrededor:
[
  {
    "question": "Variante 1 de la pregunta original",
    "options": [
      { "text": "Variante de opción incorrecta 1", "isCorrect": false },
      { "text": "Variante de opción correcta", "isCorrect": true },
      { "text": "Variante de opción incorrecta 3", "isCorrect": false },
      { "text": "Variante de opción incorrecta 4", "isCorrect": false }
    ],
    "explanation": "La opción es correcta porque..."
  }
]
`;

    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'),
      prompt,
      temperature: 0.5,
    });

    let jsonString = text.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed: GeneratedQuestion[] = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("[GENERATE_VARIATIONS_ERROR]", error);
    throw new Error("No se pudieron generar las variantes de la plantilla.");
  }
}

