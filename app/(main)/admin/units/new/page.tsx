import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnitForm } from "@/components/admin/unit-form";

export default async function NewUnitPage() {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }

  const courses = await prisma.course.findMany({ 
    select: { id: true, title: true } 
  });

  if (courses.length === 0) {
    // Se requiere al menos un curso para crear una unidad
    redirect("/admin/courses");
  }

  return <UnitForm courses={courses} />;
}
