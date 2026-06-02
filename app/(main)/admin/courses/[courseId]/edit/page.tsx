import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/course-form";

export default async function EditCoursePage({ params }: { params: { courseId: string } }) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
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
