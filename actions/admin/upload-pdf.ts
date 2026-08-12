"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    examTitle: {
      type: "STRING",
      description:
        "Título del examen o fuente del PDF (ej. 'Examen de Admisión UNMSM 2024 - Comprensión Lectora')",
    },
    passages: {
      type: "ARRAY",
      description: "Cada pasaje/texto de lectura encontrado en el PDF",
      items: {
        type: "OBJECT",
        properties: {
          passageTitle: {
            type: "STRING",
            description:
              "Título corto que describe el tema del texto (ej. 'La inteligencia artificial en la educación')",
          },
          fullText: {
            type: "STRING",
            description:
              "El texto COMPLETO e ÍNTEGRO del pasaje de lectura, copiado tal cual del PDF sin resumir ni omitir nada.",
          },
          difficulty: {
            type: "STRING",
            description:
              "Nivel de dificultad estimado: 'BASICO', 'INTERMEDIO' o 'AVANZADO'",
          },
          questions: {
            type: "ARRAY",
            description:
              "TODAS las preguntas asociadas a este texto que aparecen en el PDF. NO omitas ninguna.",
            items: {
              type: "OBJECT",
              properties: {
                questionText: {
                  type: "STRING",
                  description:
                    "La pregunta EXACTA tal como aparece en el examen.",
                },
                questionType: {
                  type: "STRING",
                  description:
                    "Tipo de pregunta: 'LITERAL', 'INFERENCIAL' o 'CRITICA'",
                },
                options: {
                  type: "ARRAY",
                  description:
                    "Todas las opciones de respuesta tal como aparecen en el examen (A, B, C, D, E).",
                  items: {
                    type: "OBJECT",
                    properties: {
                      text: {
                        type: "STRING",
                        description: "El texto de la opción de respuesta.",
                      },
                      isCorrect: {
                        type: "BOOLEAN",
                        description:
                          "true SOLO para la respuesta correcta, false para las demás.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const PROMPT_TEXT = `Eres un sistema experto en análisis de exámenes de admisión universitarios peruanos.
El documento PDF que recibirás es un examen de admisión completo que contiene múltiples materias (Matemáticas, Física, Química, Historia, etc.). 

Tu tarea principal es IDENTIFICAR las áreas del examen y OMITIR (ignorar por completo) cualquier materia que sea de ciencias, matemáticas o letras sin textos de lectura.
DEBES EXTRAER ÚNICAMENTE la sección de "Comprensión Lectora", "Razonamiento Verbal" o "Lenguaje" que contenga textos largos con preguntas.

INSTRUCCIONES ESTRICTAS:
1. IGNORAR MATERIAS NO RELEVANTES: Salta y elimina silenciosamente todas las preguntas de matemáticas, números, fórmulas, biología, química, etc. No las incluyas en absoluto.
2. TEXTOS: Busca TODOS los textos/pasajes de lectura del documento correspondientes a Razonamiento Verbal o Comprensión Lectora. Cópialos COMPLETOS en "fullText", sin resumir ni omitir ni un solo párrafo.
3. PREGUNTAS: Para CADA texto, extrae ABSOLUTAMENTE TODAS las preguntas de comprensión lectora que el examen incluye para ese texto. NO inventes preguntas nuevas.
4. OPCIONES: Para cada pregunta, incluye TODAS las opciones de respuesta (A, B, C, D, E) exactamente como aparecen en el examen. Marca con isCorrect=true SOLO la respuesta correcta.
5. CLASIFICACIÓN:
   - questionType: Clasifica cada pregunta como "LITERAL", "INFERENCIAL" o "CRITICA".
   - difficulty: Clasifica cada texto como "BASICO", "INTERMEDIO" o "AVANZADO".
6. TÍTULO: Genera un "examTitle" descriptivo basado en la fuente del examen (universidad, año, etc.).

IMPORTANTE: El objetivo es ahorrarle tiempo al profesor. Si el PDF tiene 100 páginas y solo 5 son de comprensión lectora, tu JSON resultante debe contener EXCLUSIVAMENTE los datos de esas 5 páginas de texto y absolutamente 0 preguntas de matemáticas.`;

async function callGeminiWithRetry(base64Pdf: string, maxRetries = 3): Promise<any> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY no está configurada en .env");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Gemini] Intento ${attempt}/${maxRetries}...`);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT_TEXT },
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64Pdf,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) throw new Error("Gemini devolvió una respuesta vacía.");
      return JSON.parse(jsonText);
    }

    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `HTTP ${response.status}`;
    
    if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 8000));
      continue;
    }
    throw new Error(`Error de Gemini: ${errMsg}`);
  }
  throw new Error("Se agotaron los reintentos con Gemini.");
}

export const parsePdfWithAI = async (formData: FormData) => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado." };

  // Solo administradores y profesores pueden usar el análisis con IA (es costoso)
  if (!isAdmin()) {
    const progress = await prisma.userProgress.findUnique({ where: { userId } });
    if (!progress?.isTeacher) {
      return { error: "Solo administradores y profesores pueden subir PDFs." };
    }
  }

  const file = formData.get("pdf") as File | null;
  if (!file) return { error: "No se proporcionó ningún archivo." };
  if (file.size > 50 * 1024 * 1024) return { error: "El PDF supera el límite de 50MB." };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Pdf = buffer.toString("base64");

    // Subir el PDF a Cloudinary (el filesystem de Vercel es de solo lectura)
    let pdfUrl: string | null = null;
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
      const uploadResult = await cloudinary.uploader.upload(
        `data:application/pdf;base64,${base64Pdf}`,
        {
          folder: "rutacachimbo/pdf",
          resource_type: "raw",
          public_id: `${Date.now()}-${safeName}`,
        }
      );
      pdfUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("[Cloudinary upload]", uploadError);
      // No bloquear el análisis con IA si falla el almacenamiento del archivo
    }

    const result = await callGeminiWithRetry(base64Pdf);
    
    // Inject metadata so the next step can save it
    result.__pdfUrl = pdfUrl;
    result.__pdfName = file.name;

    if (!result.passages || result.passages.length === 0) {
      return { error: "Gemini no encontró textos de comprensión lectora en el PDF." };
    }

    // Inicializar el flag de 'included' en true para la UI
    result.passages = result.passages.map((p: any) => ({
      ...p,
      included: true,
      questions: p.questions?.map((q: any) => ({ ...q, included: true })) || []
    }));

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Parse PDF]", error);
    return { error: error?.message || "Error inesperado al procesar el PDF." };
  }
};

export const saveReviewedContent = async (payload: { classroomIdStr: string | null, courseIdStr?: string | null, result: any }) => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado." };

  const { classroomIdStr, courseIdStr, result } = payload;
  if (!classroomIdStr && !courseIdStr && !isAdmin()) {
    return { error: "Solo los administradores pueden subir PDFs globales." };
  }

  try {
    let difficultyToUnitId: Record<string, number> = { BASICO: 1, INTERMEDIO: 2, AVANZADO: 3 };

    if (courseIdStr) {
      const courseId = parseInt(courseIdStr);
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { classroom: true }
      });
      if (!course) return { error: "Curso no encontrado." };

      if (course.classroom && course.classroom.teacherId !== userId && !isAdmin()) {
        return { error: "No tienes permisos para modificar este curso." };
      }

      let units = await prisma.unit.findMany({ where: { courseId } });
      if (units.length === 0) {
        const unitBasic = await prisma.unit.create({ data: { title: "Nivel Básico", description: "Preguntas literales", courseId, order: 1 } });
        const unitInter = await prisma.unit.create({ data: { title: "Nivel Intermedio", description: "Preguntas inferenciales", courseId, order: 2 } });
        const unitAdv = await prisma.unit.create({ data: { title: "Nivel Avanzado", description: "Análisis crítico", courseId, order: 3 } });
        units = [unitBasic, unitInter, unitAdv];
      }

      difficultyToUnitId = {
        BASICO: units.find(u => u.title.includes("Básico"))?.id || units[0]?.id || 1,
        INTERMEDIO: units.find(u => u.title.includes("Intermedio"))?.id || units[0]?.id || 2,
        AVANZADO: units.find(u => u.title.includes("Avanzado"))?.id || units[0]?.id || 3,
      };
    } else if (classroomIdStr) {
      const classroomId = parseInt(classroomIdStr);
      const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
      if (!classroom || classroom.teacherId !== userId) return { error: "Aula no encontrada." };

      const newCourse = await prisma.course.create({
        data: { title: result.examTitle || "Simulacro", imageSrc: "/mascot.svg", classroomId: classroom.id }
      });

      const unitBasic = await prisma.unit.create({ data: { title: "Nivel Básico", description: "Preguntas literales", courseId: newCourse.id, order: 1 } });
      const unitInter = await prisma.unit.create({ data: { title: "Nivel Intermedio", description: "Preguntas inferenciales", courseId: newCourse.id, order: 2 } });
      const unitAdv = await prisma.unit.create({ data: { title: "Nivel Avanzado", description: "Análisis crítico", courseId: newCourse.id, order: 3 } });

      difficultyToUnitId = { BASICO: unitBasic.id, INTERMEDIO: unitInter.id, AVANZADO: unitAdv.id };
    } else {
      let globalCourse = await prisma.course.findFirst({ where: { title: "Simulacros Globales IA" } });
      if (!globalCourse) {
        globalCourse = await prisma.course.create({
          data: { title: "Simulacros Globales IA", imageSrc: "/mascot.svg" }
        });
        const unitBasic = await prisma.unit.create({ data: { title: "Nivel Básico", description: "Preguntas literales", courseId: globalCourse.id, order: 1 } });
        const unitInter = await prisma.unit.create({ data: { title: "Nivel Intermedio", description: "Preguntas inferenciales", courseId: globalCourse.id, order: 2 } });
        const unitAdv = await prisma.unit.create({ data: { title: "Nivel Avanzado", description: "Análisis crítico", courseId: globalCourse.id, order: 3 } });
        difficultyToUnitId = { BASICO: unitBasic.id, INTERMEDIO: unitInter.id, AVANZADO: unitAdv.id };
      } else {
        const units = await prisma.unit.findMany({ where: { courseId: globalCourse.id } });
        difficultyToUnitId = {
          BASICO: units.find(u => u.title.includes("Básico"))?.id || units[0]?.id || 1,
          INTERMEDIO: units.find(u => u.title.includes("Intermedio"))?.id || units[0]?.id || 2,
          AVANZADO: units.find(u => u.title.includes("Avanzado"))?.id || units[0]?.id || 3,
        };
      }
    }

    let finalClassroomId: number | null = null;
    if (courseIdStr) {
      const courseId = parseInt(courseIdStr);
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course?.classroomId) {
        finalClassroomId = course.classroomId;
      }
    } else if (classroomIdStr) {
      finalClassroomId = parseInt(classroomIdStr);
    }

    // Crear el registro de PDF Documento primero para tener su ID
    let pdfDoc = null;
    const pdfUrl = result.__pdfUrl;
    const pdfName = result.__pdfName || result.examTitle || "Examen Subido (IA)";
    if (pdfUrl) {
      pdfDoc = await prisma.pdfDocument.create({
        data: {
          title: pdfName,
          url: pdfUrl,
          classroomId: finalClassroomId && !isNaN(finalClassroomId) ? finalClassroomId : null,
          userId: userId
        }
      });
    }

    const existingLessons = await prisma.lesson.findMany();
    const maxOrderPerUnit: Record<number, number> = {};
    for (const l of existingLessons) {
      maxOrderPerUnit[l.unitId] = Math.max(maxOrderPerUnit[l.unitId] || 0, l.order);
    }

    let totalPassages = 0;
    let totalQuestions = 0;

    for (let i = 0; i < result.passages.length; i++) {
      const passage = result.passages[i];
      if (!passage.included) continue;

      const difficulty = (passage.difficulty || "BASICO").toUpperCase();
      const targetUnitId = difficultyToUnitId[difficulty] || difficultyToUnitId["BASICO"];

      maxOrderPerUnit[targetUnitId] = (maxOrderPerUnit[targetUnitId] || 0) + 1;
      const lessonOrder = maxOrderPerUnit[targetUnitId];

      const textToSave = (passage.fullText && passage.fullText.trim().length > 30)
        ? passage.fullText.trim()
        : `Texto de lectura para: ${passage.passageTitle || 'Comprensión Lectora'}.\n\nEste pasaje fue procesado para análisis de preguntas de comprensión lectora.`;

      const insertedLesson = await prisma.lesson.create({
        data: {
          unitId: targetUnitId,
          title: passage.passageTitle || `Lectura ${i + 1}`,
          order: lessonOrder,
          referenceText: textToSave,
          pdfDocumentId: pdfDoc ? pdfDoc.id : null
        }
      });
      totalPassages++;

      if (passage.questions && Array.isArray(passage.questions)) {
        for (let j = 0; j < passage.questions.length; j++) {
          const q = passage.questions[j];
          if (!q.included) continue;

          const questionLabel = q.questionType === "LITERAL" ? "📖 " : q.questionType === "INFERENCIAL" ? "🔍 " : q.questionType === "CRITICA" ? "💡 " : "";
          const insertedChallenge = await prisma.challenge.create({
            data: {
              lessonId: insertedLesson.id,
              type: "SELECT",
              question: `${questionLabel}${q.questionText || "Pregunta " + (j + 1)}`,
              order: j + 1,
            }
          });

          if (q.options && Array.isArray(q.options)) {
            const optionsToInsert = q.options.map((opt: any) => ({
              challengeId: insertedChallenge.id,
              text: opt.text || "Opción sin texto",
              correct: opt.isCorrect === true,
            }));
            await prisma.challengeOption.createMany({ data: optionsToInsert });
          }
          totalQuestions++;
        }
      }
    }

    revalidatePath("/learn");
    revalidatePath("/admin");
    revalidatePath("/archivos");

    return { success: true, message: `Aprobado y guardado: ${totalPassages} lecturas y ${totalQuestions} preguntas.` };
  } catch (error: any) {
    console.error("[Save DB]", error);
    return { error: error?.message || "Ocurrió un error inesperado al guardar." };
  }
};

export const processPdfExam = async (formData: FormData) => {
  const parsed = await parsePdfWithAI(formData);
  if (parsed.error || !parsed.data) return parsed;
  
  const classroomIdStr = formData.get("classroomId") as string | null;
  const courseIdStr = formData.get("courseId") as string | null;
  return saveReviewedContent({ classroomIdStr, courseIdStr, result: parsed.data });
};
