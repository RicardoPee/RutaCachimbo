import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import { isAdminId } from "@/lib/admin";

export default async function NewLessonPage() {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const units = await prisma.unit.findMany({ 
    include: { course: true },
    orderBy: [{ courseId: 'asc' }, { order: 'asc' }]
  });

  if (units.length === 0) {
    // Se requiere al menos una unidad para crear una lección
    redirect("/admin/units");
  }

  return <LessonForm units={units} />;
}
