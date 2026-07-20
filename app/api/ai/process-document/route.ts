import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromPdfUrl } from "@/lib/ai/extractor";
import { generateQuestionsFromText } from "@/lib/ai/generator";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminId } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate Limit for PDF processing (expensive)
    const { success } = rateLimit(`process-doc:${userId}`, { limit: 5, windowMs: 60_000 });
    if (!success) {
      return new NextResponse("Demasiadas solicitudes. Espera un momento.", { status: 429 });
    }

    // Check permissions (Admins or Teachers only)
    const progress = await prisma.userProgress.findUnique({ where: { userId } });
    const isAllowed = isAdminId(userId) || progress?.isTeacher;
    if (!isAllowed) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { pdfUrl, lessonId, amount = 5 } = await req.json();

    if (!pdfUrl || !lessonId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 1. Extraer el texto
    const text = await extractTextFromPdfUrl(pdfUrl);
    
    if (text.length < 50) {
      return new NextResponse("El documento no contiene texto suficiente para procesar.", { status: 400 });
    }

    // 2. Generar preguntas usando Gemini
    const generatedQuestions = await generateQuestionsFromText(text, amount);

    // 3. Guardar en Base de Datos usando Prisma
    let lastOrder = 0;
    const existingChallenges = await prisma.challenge.findMany({
      where: { lessonId: Number(lessonId) },
      orderBy: { order: 'desc' },
      take: 1
    });
    
    if (existingChallenges.length > 0) {
      lastOrder = existingChallenges[0].order;
    }

    let currentOrder = lastOrder + 1;
    let savedCount = 0;

    for (const gq of generatedQuestions) {
      // Usar SELECT_MULTIPLE por defecto para texto
      const challenge = await prisma.challenge.create({
        data: {
          lessonId: Number(lessonId),
          type: "SELECT",
          question: gq.question,
          order: currentOrder,
          // explanation: gq.explanation // If the schema supported explanation, we'd add it here.
        }
      });
      currentOrder++;

      const optionsData = gq.options.map((opt) => ({
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.isCorrect,
        imageSrc: "",
        audioSrc: ""
      }));

      await prisma.challengeOption.createMany({
        data: optionsData
      });
      
      savedCount++;
    }

    // Update lesson to store reference text
    await prisma.lesson.update({
      where: { id: Number(lessonId) },
      data: { referenceText: text }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Procesado correctamente. ${savedCount} preguntas generadas.` 
    });

  } catch (error) {
    console.error("[PROCESS_DOCUMENT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

