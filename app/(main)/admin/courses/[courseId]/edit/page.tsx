import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/course-form";
import { isAdminId } from "@/lib/admin";

export default async function EditCoursePage({ params }: { params: { courseId: string } }) {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const course = await prisma.course.findUnique({
    where: { id: parseInt(params.courseId) },
  });

  if (!course) {
    redirect("/admin/courses");
  }

  return <CourseForm initialData={course} />;
}
