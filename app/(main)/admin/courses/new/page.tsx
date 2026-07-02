import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { isAdminId } from "@/lib/admin";

export default async function NewCoursePage() {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  return <CourseForm />;
}
