import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { teacherApplications, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ApplyForm } from "./apply-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const TeacherApplyPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (progress?.isTeacher) {
    redirect("/teacher/classrooms");
  }

  const application = await db.query.teacherApplications.findFirst({
    where: eq(teacherApplications.userId, userId),
  });

  return (
    <div className="max-w-[600px] px-3 mx-auto mt-10">
      <div className="flex flex-col items-center mb-8 text-center">
        <Image src="/mascot.svg" alt="Mascot" width={80} height={80} />
        <h1 className="text-2xl font-bold text-neutral-700 mt-4">
          Modo Profesor
        </h1>
        <p className="text-neutral-500 mt-2">
          Para crear tus propias aulas privadas y subir simulacros PDF para tus estudiantes, necesitas una cuenta de Profesor verificada.
        </p>
      </div>

      {!application || application.status === "REJECTED" ? (
        <div className="bg-white border-2 border-slate-200 p-6 rounded-xl shadow-sm">
          {application?.status === "REJECTED" && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              Tu solicitud anterior fue rechazada. Por favor, asegúrate de proporcionar un enlace válido (que no requiera permisos) y vuelve a intentarlo.
            </div>
          )}
          <h2 className="font-bold text-lg text-neutral-700 mb-4">Solicitar Acceso</h2>
          <ApplyForm />
        </div>
      ) : application.status === "PENDING" ? (
        <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-xl shadow-sm text-center flex flex-col items-center">
          <Image src="/quests.svg" alt="Pending" width={64} height={64} className="mb-4" />
          <h2 className="font-bold text-xl text-orange-600 mb-2">Solicitud en Revisión</h2>
          <p className="text-orange-500 mb-6 text-sm">
            Nuestro equipo está revisando tu evidencia. Esto puede tomar unas horas.
          </p>
          <Link href="/learn">
            <Button variant="secondary">Volver al Inicio</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default TeacherApplyPage;
