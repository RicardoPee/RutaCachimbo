import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CreateClassroomForm } from "./create-form";
import { ClassroomCoursesList } from "./classroom-courses-list";

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
    include: {
      courses: {
        include: {
          units: {
            include: {
              lessons: {
                include: {
                  challenges: {
                    include: {
                      challengeOptions: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
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

      <ClassroomCoursesList classrooms={myClassrooms} />
    </div>
  );
};

export default TeacherClassroomsPage;
