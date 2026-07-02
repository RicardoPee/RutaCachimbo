"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isAdminId } from "@/lib/admin";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function simplifyAndSaveReferenceText(lessonId: number, currentText: string) {
  const { userId } = auth();
  if (!isAdminId(userId)) return { error: "No autorizado" };

  try {
    let response;
    let errText = "";
    
    // Retries logic for 429 (Quota Exceeded) or 503
    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(`${GEMINI_API_URL}?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Eres un tutor experto. Toma el siguiente texto de comprensión lectora, que proviene de un PDF y puede contener URLs, metadatos y falta de saltos de línea.
Tu objetivo es:
1. Eliminar URLs, links inútiles y basura.
2. Dividirlo en párrafos legibles con dobles saltos de línea.
3. Hacerlo limpio y profesional para un alumno de pre o universidad.
Devuelve SOLO el texto limpio, sin comentarios tuyos.

Texto original:
${currentText}`
            }]
          }],
          generationConfig: {
            temperature: 0.2
          }
        })
      });

      if (response.ok) break;
      
      errText = await response.text();
      if ((response.status === 429 || response.status === 503) && attempt < 3) {
        console.log(`[Gemini] Error 429. Esperando ${attempt * 10} segundos (Intento ${attempt}/3)...`);
        await new Promise(res => setTimeout(res, attempt * 10000));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      console.error("Error from Gemini API:", errText);
      // User-friendly message for quota exceeded
      if (errText.includes("exceeded your current quota")) {
        return { error: "Tu llave de Gemini (API Key) superó el límite gratuito de Google. Espera un minuto o cambia de API Key." };
      }
      return { error: `Error al contactar a la IA: ${errText.substring(0, 100)}...` };
    }

    const data = await response.json();
    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!cleanText) return { error: "No se pudo limpiar el texto" };

    // Update the database persistently
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { referenceText: cleanText }
    });

    revalidatePath("/admin-panel");
    return { success: true, cleanText };
  } catch (e) {
    return { error: "Error procesando el texto con IA" };
  }
}
