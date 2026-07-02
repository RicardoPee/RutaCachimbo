"use server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { AI_MODEL } from "@/constants";

export async function generateMedicalDiagnosis() {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  const results = await prisma.mockExamResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  if (results.length === 0) {
    return { diagnosis: "Historial en blanco. Necesitas rendir al menos un simulacro para que el Doctor IA te pueda evaluar." };
  }

  const prompt = `
Eres un Doctor Especialista en Rendimiento Académico Preuniversitario. Estás evaluando el "historial médico" de un estudiante.
Resultados de sus últimos ${results.length} simulacros:
${JSON.stringify(results.map(r => ({ correctas: r.correct, incorrectas: r.incorrect, enBlanco: r.blank, puntaje: r.score })))}

Elabora un "Diagnóstico Médico Académico" de 2 o 3 párrafos cortos. 
Usa términos médicos metafóricos (ej. "taquicardia matemática", "anemia de lectura", "sistema nervioso analítico", "reflejos lentos").
Al final, escribe una sección llamada "RECETA MÉDICA:" con una dosis o instrucción estricta de estudio (sin viñetas).
Tu tono debe ser profesional, clínico y un poco estricto.
`;

  try {
    const { text } = await generateText({
      model: google(AI_MODEL),
      prompt,
    });
    return { diagnosis: text || "El Doctor IA está fuera de servicio." };
  } catch (error) {
    return { error: "Error de conexión con el Hospital IA." };
  }
}
