import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";

export default async function NewCoursePage() {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }

  return <CourseForm />;
}
