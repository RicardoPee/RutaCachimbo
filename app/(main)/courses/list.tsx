"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Course, UserProgress } from "@prisma/client";
import { upsertUserProgress } from "@/actions/user-progress";

import { Card } from "./card";

type CourseWithClassroom = Course & {
  classroom?: {
    id: number;
    name: string;
  } | null;
};

type Props = {
  courses: CourseWithClassroom[];
  activeCourseId?: UserProgress["activeCourseId"];
};

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (id: number) => {
    if (pending) return;

    if (id === activeCourseId) {
      return router.push("/learn");
    }

    startTransition(() => {
      upsertUserProgress(id)
        .then((response) => {
          if (response?.error === "empty") {
            toast.error("Este curso aún no tiene lecciones. Usa el Panel de Admin para crearlas.");
          }
        })
        .catch(() => toast.error("Ocurrió un error."));
    });
  };

  const globalCourses = courses.filter((c) => !c.classroomId);
  const classroomCourses = courses.filter((c) => c.classroomId && c.classroom);

  const coursesByClassroom: Record<string, CourseWithClassroom[]> = {};
  classroomCourses.forEach((c) => {
    const className = c.classroom?.name || "Mi Aula";
    if (!coursesByClassroom[className]) {
      coursesByClassroom[className] = [];
    }
    coursesByClassroom[className].push(c);
  });

  return (
    <div className="space-y-8 pt-6">
      {globalCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-neutral-700 dark:text-neutral-300 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full" />
            Materias Preuniversitarias (Autoaprendizaje)
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {globalCourses.map((course) => (
              <Card
                key={course.id}
                id={course.id}
                title={course.title}
                imageSrc={course.imageSrc}
                onClick={onClick}
                disabled={pending}
                active={course.id === activeCourseId}
              />
            ))}
          </div>
        </div>
      )}

      {Object.entries(coursesByClassroom).map(([className, classCourses]) => (
        <div key={className} className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-neutral-700 dark:text-neutral-300 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full" />
            Asignaturas de tu Aula: {className}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {classCourses.map((course) => (
              <Card
                key={course.id}
                id={course.id}
                title={course.title}
                imageSrc={course.imageSrc}
                onClick={onClick}
                disabled={pending}
                active={course.id === activeCourseId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
