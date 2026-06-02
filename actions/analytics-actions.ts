"use server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await response.json();
    const diagnosis = data.candidates?.[0]?.content?.parts?.[0]?.text || "El Doctor IA está fuera de servicio.";
    return { diagnosis };
  } catch (error) {
    return { error: "Error de conexión con el Hospital IA." };
  }
}
