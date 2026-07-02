import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Plus, BookOpen } from "lucide-react";
import { isAdminId } from "@/lib/admin";

export default async function CoursesAdminPage() {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const courses = await prisma.course.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
            <BookOpen className="w-8 h-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Gestión de Cursos
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Administra los cursos disponibles en la plataforma
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600 text-white border-b-4 border-sky-600 active:border-b-0 transition-all rounded-xl">
          <Link href="/admin/courses/new">
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            NUEVO CURSO
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-background/50 border-b-2 border-border">
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">ID</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">Imagen</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs w-full">Título</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">
                    No hay cursos registrados. Haz clic en &quot;Nuevo Curso&quot; para empezar.
                  </td>
                </tr>
              )}
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-slate-100 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5 font-bold text-slate-400 dark:text-slate-500">{course.id}</td>
                  <td className="p-5">
                    <div className="w-12 h-12 relative bg-sky-100 dark:bg-sky-900/20 rounded-xl overflow-hidden border-2 border-sky-200 dark:border-sky-900 flex items-center justify-center">
                      <img 
                        src={course.imageSrc} 
                        alt={course.title} 
                        className="object-contain w-full h-full p-2" 
                      />
                    </div>
                  </td>
                  <td className="p-5 font-extrabold text-lg text-foreground">
                    {course.title}
                  </td>
                  <td className="p-5 text-right">
                    <Button asChild size="sm" variant="ghost" className="text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30">
                      <Link href={`/admin/courses/${course.id}/edit`}>
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
