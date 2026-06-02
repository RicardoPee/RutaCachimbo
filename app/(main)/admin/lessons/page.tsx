import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Plus, Layers } from "lucide-react";

export default async function LessonsAdminPage() {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }

  const lessons = await prisma.lesson.findMany({
    orderBy: [
      { unitId: "asc" },
      { order: "asc" }
    ],
    include: { unit: { include: { course: true } } }
  });

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl">
            <Layers className="w-8 h-8 text-fuchsia-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Gestión de Lecciones
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Administra las lecciones pertenecientes a cada unidad
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-b-4 border-fuchsia-600 active:border-b-0 transition-all rounded-xl">
          <Link href="/admin/lessons/new">
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            NUEVA LECCIÓN
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-background/50 border-b-2 border-border">
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">Orden</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">Ubicación</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs w-full">Título</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">
                    No hay lecciones registradas.
                  </td>
                </tr>
              )}
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-slate-100 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5 font-bold text-slate-400 dark:text-slate-500">#{lesson.order}</td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800 whitespace-nowrap">
                        {lesson.unit.course.title}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
                        Unidad {lesson.unit.order}: {lesson.unit.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-extrabold text-lg text-foreground">{lesson.title}</p>
                    {lesson.referenceText && (
                      <p className="text-xs text-slate-500 italic mt-1 font-medium">Ref: {lesson.referenceText}</p>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <Button asChild size="sm" variant="ghost" className="text-fuchsia-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30">
                      <Link href={`/admin/lessons/${lesson.id}/edit`}>
                        <Edit className="w-5 h-5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
