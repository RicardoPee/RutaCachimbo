import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CreateClassroomForm } from "./create-form";
import { UploadPdfButton } from "./upload-btn";

const TeacherClassroomsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const progress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  if (!progress?.isTeacher) {
    redirect("/teacher/apply");
  }

  const myClassrooms = await prisma.classroom.findMany({
    where: { teacherId: userId },
  });

  return (
    <div className="max-w-[912px] px-3 mx-auto mt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-700">
          Mis Aulas (Modo Profesor)
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <CreateClassroomForm />
      </div>

      <h2 className="text-xl font-bold text-neutral-700 mb-4">
        Aulas Activas
      </h2>
      
      {myClassrooms.length === 0 ? (
        <p className="text-neutral-500">Aún no has creado ninguna aula.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClassrooms.map((cls) => (
            <div key={cls.id} className="border-2 border-slate-200 p-4 rounded-xl flex flex-col gap-y-2">
              <h3 className="font-bold text-lg text-neutral-700">{cls.name}</h3>
              <p className="text-sm text-neutral-500">{cls.description}</p>
              <div className="mt-4 bg-slate-100 p-2 rounded-lg text-center">
                <p className="text-xs text-neutral-500 mb-1">CÓDIGO DE INVITACIÓN</p>
                <p className="font-mono text-xl font-bold tracking-widest text-blue-600">{cls.inviteCode}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200">
                <UploadPdfButton classroomId={cls.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClassroomsPage;
