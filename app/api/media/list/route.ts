import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isAdminId } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    });
    const isTeacher = progress?.isTeacher === true;
    const isUserAdmin = isAdminId(userId);

    if (!isUserAdmin && !isTeacher) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let filesList;

    if (isUserAdmin) {
      filesList = await prisma.pdfDocument.findMany({
        orderBy: { createdAt: "desc" }
      });
    } else {
      // Obtener las aulas administradas por este profesor
      const myClassrooms = await prisma.classroom.findMany({
        where: { teacherId: userId },
        select: { id: true }
      });
      const classroomIds = myClassrooms.map((c) => c.id);

      filesList = await prisma.pdfDocument.findMany({
        where: {
          OR: [
            { userId: userId },
            { classroomId: { in: classroomIds } }
          ]
        },
        orderBy: { createdAt: "desc" }
      });
    }

    const mediaFiles = filesList.map((doc) => {
      const urlLower = doc.url.toLowerCase();
      const isImage = 
        urlLower.includes(".png") || 
        urlLower.includes(".jpg") || 
        urlLower.includes(".jpeg") || 
        urlLower.includes(".webp") || 
        urlLower.includes(".gif");
      const isAudio = 
        urlLower.includes(".mp3") || 
        urlLower.includes(".wav") || 
        urlLower.includes(".aac") || 
        urlLower.includes(".m4a") || 
        urlLower.includes(".ogg");

      return {
        url: doc.url,
        name: doc.title,
        isImage,
        type: isImage ? "image" : isAudio ? "audio" : "documento",
        createdAt: doc.createdAt.toISOString()
      };
    });

    return NextResponse.json({ files: mediaFiles });
  } catch (error) {
    console.error("List media error:", error);
    return NextResponse.json({ files: [] });
  }
}
