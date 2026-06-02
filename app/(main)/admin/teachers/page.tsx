import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { TeacherAdminClient } from "./teacher-admin-client";

export default async function AdminTeachersPage() {
  const { userId } = auth();
  const adminId = process.env.ADMIN_USER_ID;

  if (userId !== adminId) {
    redirect("/");
  }

  const applications = await prisma.teacherApplication.findMany({
    orderBy: { id: "desc" },
    include: {
      user: {
        select: {
          userName: true,
          userImageSrc: true
        }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">Solicitudes Docentes</h1>
        <p className="text-slate-500">Revisa y aprueba a los nuevos profesores para la academia.</p>
      </div>

      <TeacherAdminClient applications={applications} />
    </div>
  );
}
