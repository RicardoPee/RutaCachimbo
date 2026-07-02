import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import { isAdminId } from "@/lib/admin";

export default async function EditLessonPage({ params }: { params: { lessonId: string } }) {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: parseInt(params.lessonId) },
  });

  if (!lesson) {
    redirect("/admin/lessons");
  }

  const units = await prisma.unit.findMany({ 
    include: { course: true },
    orderBy: [{ courseId: 'asc' }, { order: 'asc' }]
  });

  return <LessonForm initialData={lesson as any} units={units} />;
}
