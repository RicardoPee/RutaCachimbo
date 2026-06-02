import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { AlertCircle, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function MistakesPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const mistakes = await prisma.mistakeLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50 // Limit to last 50 mistakes
  });

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-rose-100 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">Mi Registro de Errores</h1>
          <p className="text-slate-500 font-medium">Revisa en qué te equivocaste para no volver a cometer el mismo error.</p>
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center">
          <Target className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">¡Excelente Trabajo!</h2>
          <p className="text-slate-500">No tienes errores registrados recientemente. Sigue así.</p>
          <Link href="/learn" className="inline-flex items-center mt-6 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700">
            Seguir Aprendiendo <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((mistake) => (
            <div key={mistake.id} className="bg-white border-2 border-slate-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <span className="bg-slate-100 text-slate-500 text-xs font-black uppercase px-2 py-1 rounded tracking-wider">
                    {mistake.context}
                  </span>
                  <span className="ml-2 text-xs text-slate-400 font-medium">
                    {new Date(mistake.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-lg font-bold text-slate-800">
                  {mistake.questionText}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                    <p className="text-xs font-black uppercase text-rose-600 mb-1 tracking-wider">Tu Respuesta (Incorrecta)</p>
                    <p className="font-medium text-rose-900">{mistake.wrongAnswerText}</p>
                  </div>
                  
                  {mistake.correctAnswerText && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <p className="text-xs font-black uppercase text-emerald-600 mb-1 tracking-wider">Respuesta Correcta</p>
                      <p className="font-medium text-emerald-900">{mistake.correctAnswerText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
