import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Plus, BookOpen } from "lucide-react";
import { isAdminId } from "@/lib/admin";

export default async function UnitsAdminPage() {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const units = await prisma.unit.findMany({
    orderBy: [
      { courseId: "asc" },
      { order: "asc" }
    ],
    include: { course: true }
  });

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <BookOpen className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Gestión de Unidades
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Administra las unidades (capítulos) agrupadas por curso
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white border-b-4 border-indigo-600 active:border-b-0 transition-all rounded-xl">
          <Link href="/admin/units/new">
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            NUEVA UNIDAD
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-background/50 border-b-2 border-border">
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">Orden</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">Curso</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs w-full">Título y Descripción</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {units.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">
                    No hay unidades registradas.
                  </td>
                </tr>
              )}
              {units.map((unit) => (
                <tr key={unit.id} className="border-b border-slate-100 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5 font-bold text-slate-400 dark:text-slate-500">#{unit.order}</td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800 whitespace-nowrap">
                      {unit.course.title}
                    </span>
                  </td>
                  <td className="p-5">
                    <p className="font-extrabold text-lg text-foreground">{unit.title}</p>
                    <p className="text-sm text-slate-500 truncate max-w-sm mt-1">{unit.description}</p>
                  </td>
                  <td className="p-5 text-right">
                    <Button asChild size="sm" variant="ghost" className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                      <Link href={`/admin/units/${unit.id}/edit`}>
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
