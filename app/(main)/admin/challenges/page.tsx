import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Plus, Swords } from "lucide-react";
import { isAdminId } from "@/lib/admin";

export default async function ChallengesAdminPage() {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const challenges = await prisma.challenge.findMany({
    orderBy: [
      { lessonId: "asc" },
      { order: "asc" }
    ],
    include: { lesson: { include: { unit: { include: { course: true } } } } }
  });

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
            <Swords className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Gestión de Retos
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Administra las preguntas (retos) de cada lección
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600 text-white border-b-4 border-rose-600 active:border-b-0 transition-all rounded-xl">
          <Link href="/admin/challenges/new">
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            NUEVO RETO
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-background/50 border-b-2 border-border">
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">Tipo/Orden</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs">Ubicación</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs w-full">Pregunta</th>
                <th className="p-5 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {challenges.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">
                    No hay retos registrados.
                  </td>
                </tr>
              )}
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="border-b border-slate-100 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${challenge.type === 'SELECT' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                        {challenge.type}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 font-bold text-xs mt-1">Orden #{challenge.order}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
                        {challenge.lesson.unit.course.title} {">"} Ud. {challenge.lesson.unit.order}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 whitespace-nowrap">
                        Lección: {challenge.lesson.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-extrabold text-lg text-foreground">{challenge.question}</p>
                  </td>
                  <td className="p-5 text-right">
                    <Button asChild size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                      <Link href={`/admin/challenges/${challenge.id}/edit`}>
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
