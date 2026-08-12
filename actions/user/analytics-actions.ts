"use server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { AI_MODEL } from "@/constants";

export async function generatePerformanceAnalysis() {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  const results = await prisma.mockExamResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  if (results.length === 0) {
    return { diagnosis: "Historial vacío. Realiza al menos un simulacro para generar tu análisis de rendimiento." };
  }

  const prompt = `
Eres un Asesor y Analista de Rendimiento Académico Preuniversitario. Tu objetivo es evaluar el desempeño de un estudiante basándote en sus simulacros recientes.

Resultados de sus últimos ${results.length} simulacros:
${JSON.stringify(results.map(r => ({ correctas: r.correct, incorrectas: r.incorrect, enBlanco: r.blank, puntaje: r.score })))}

Elabora un informe estructurado, formal y profesional en texto plano.

REGLAS CRÍTICAS DE FORMATO:
1. Queda estrictamente PROHIBIDO el uso de caracteres Markdown como asteriscos (* o **) o guiones para dar énfasis o crear títulos. No los uses bajo ninguna circunstancia.
2. Para los encabezados de sección, usa texto simple en MAYÚSCULAS y ponlos en su propia línea sin ningún símbolo adicional. Por ejemplo:
ANALISIS DE RENDIMIENTO ACADEMICO
3. Separa las secciones y párrafos con saltos de línea dobles para que el texto sea perfectamente legible.
4. No utilices listas con viñetas. Desarrolla las recomendaciones como un párrafo directo y descriptivo.
5. Queda terminantemente PROHIBIDO utilizar metáforas médicas, clínicas o referencias a "pacientes", "doctores", "enfermedades", "taquicardias", "anemias" o "recetas". Utiliza terminología puramente académica y estadística.

ESTRUCTURA DEL INFORME:
- Escribe el título ANALISIS DE RENDIMIENTO ACADEMICO.
- Desarrolla el análisis del desempeño general en 2 o 3 párrafos cortos utilizando terminología educativa y métricas de examen (ej. "tasa de acierto", "gestión del tiempo", "consistencia de puntaje", "áreas de oportunidad").
- Escribe el título PLAN DE ACCION RECOMENDADO.
- Describe una estrategia de estudio estricta y pautas directas para corregir los errores identificados.

Mantén un tono formal, profesional, instructivo y motivador.
`;

  try {
    const { text } = await generateText({
      model: google(AI_MODEL),
      prompt,
    });
    return { diagnosis: text || "El servicio de análisis de rendimiento no está disponible." };
  } catch (error) {
    return { error: "Error al conectar con el motor de Inteligencia Artificial." };
  }
}
