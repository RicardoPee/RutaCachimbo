import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, MinusCircle, Award, Clock, ArrowRight, BrainCircuit } from "lucide-react";
import { ReportChart } from "./report-chart";

export default async function ReportPage({ params }: { params: { examId: string } }) {
  const { userId } = auth();
  if (!userId) redirect("/");

  const examId = parseInt(params.examId);
  const result = await prisma.mockExamResult.findUnique({
    where: { id: examId }
  });

  if (!result || result.userId !== userId) {
    redirect("/simulacros");
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const isApproved = result.score >= 50;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 py-8 animate-in fade-in zoom-in duration-500">
      
      <div className={`p-8 rounded-3xl border-2 flex flex-col md:flex-row items-center justify-between shadow-sm ${isApproved ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'}`}>
        <div>
          <h1 className={`text-4xl font-black mb-2 ${isApproved ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
            {isApproved ? '¡Simulacro Completado!' : 'Sigue Practicando'}
          </h1>
          <p className={`font-medium ${isApproved ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
            Tu puntuación final calculada estilo admisión.
          </p>
        </div>
        <div className={`mt-6 md:mt-0 px-8 py-4 rounded-2xl flex items-center gap-3 border-2 ${isApproved ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' : 'bg-rose-500 border-rose-600 text-white shadow-sm'}`}>
          <Award className="w-8 h-8" />
          <span className="text-4xl font-black">{result.score.toFixed(2)}</span>
          <span className="text-sm font-bold opacity-80 mt-2">pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-card p-6 rounded-3xl border-2 border-border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-400">Correctas (+20)</span>
                <span className="text-2xl font-black text-neutral-800 dark:text-neutral-100">{result.correct}</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border-2 border-border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-400">Incorrectas (-1.12)</span>
                <span className="text-2xl font-black text-neutral-800 dark:text-neutral-100">{result.incorrect}</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border-2 border-border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <MinusCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-400">En Blanco (0)</span>
                <span className="text-2xl font-black text-neutral-800 dark:text-neutral-100">{result.blank}</span>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 dark:bg-sky-900/20 p-6 rounded-3xl border-2 border-sky-200 dark:border-sky-800 shadow-sm flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">Tiempo Invertido</span>
                <span className="text-2xl font-black text-sky-800 dark:text-sky-300">{formatTime(result.timeSpent)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-fuchsia-50 dark:bg-fuchsia-950/20 p-8 rounded-3xl border-2 border-fuchsia-200 dark:border-fuchsia-900/50 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-fuchsia-200 dark:bg-fuchsia-900/50 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-extrabold text-fuchsia-800 dark:text-fuchsia-300">Análisis del Tutor IA</h3>
            </div>
            <div className="prose dark:prose-invert max-w-none text-fuchsia-900 dark:text-fuchsia-200/80 leading-relaxed font-medium">
              {result.aiFeedback?.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-card p-8 rounded-3xl border-2 border-border shadow-sm flex-1 flex flex-col">
            <h3 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-6">Precisión del Simulacro</h3>
            <div className="flex-1 w-full min-h-[300px]">
              <ReportChart correct={result.correct} incorrect={result.incorrect} blank={result.blank} />
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-center mt-4 pb-8">
        <Link href="/simulacros">
          <Button size="lg" className="h-14 px-8 text-lg rounded-2xl font-bold border-b-4 active:border-b-0 transition-all" variant="primary">
            Volver al Inicio <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

    </div>
  );
}
