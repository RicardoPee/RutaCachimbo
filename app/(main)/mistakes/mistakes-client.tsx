"use client";

import { useState } from "react";
import { AlertCircle, Target, ArrowRight, BookOpen, Bot, Loader2, Sparkles, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

type MistakeItem = {
  id: number;
  userId: string;
  context: string;
  questionText: string;
  wrongAnswerText: string;
  correctAnswerText: string | null;
  createdAt: Date;
};

type Props = {
  mistakes: MistakeItem[];
};

export const MistakesClient = ({ mistakes }: Props) => {
  const [selectedPassage, setSelectedPassage] = useState<{ title: string; text: string } | null>(null);
  const [selectedAiFeedback, setSelectedAiFeedback] = useState<{ question: string; wrong: string; correct: string; feedback: string } | null>(null);
  const [loadingAiId, setLoadingAiId] = useState<number | null>(null);
  const [loadingPassageId, setLoadingPassageId] = useState<number | null>(null);

  // Solicitud de Pasaje de Lectura en Tiempo Real
  const handleViewPassage = async (mistake: MistakeItem) => {
    setLoadingPassageId(mistake.id);
    try {
      const res = await fetch("/api/ai/synthesize-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: mistake.questionText,
          context: mistake.context,
        }),
      });
      const data = await res.json();
      if (data.referenceText) {
        setSelectedPassage({
          title: `Lectura: ${mistake.questionText.slice(0, 60)}...`,
          text: data.referenceText,
        });
      } else {
        toast.error("No se pudo obtener el pasaje de lectura.");
      }
    } catch (e) {
      toast.error("Error al cargar el pasaje de lectura.");
    } finally {
      setLoadingPassageId(null);
    }
  };

  // Solicitud de Retroalimentación IA
  const handleRequestAiFeedback = async (mistake: MistakeItem) => {
    setLoadingAiId(mistake.id);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: mistake.questionText,
          selectedText: mistake.wrongAnswerText,
          correctText: mistake.correctAnswerText || "Opción Correcta",
          lessonTitle: mistake.context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedAiFeedback({
          question: mistake.questionText,
          wrong: mistake.wrongAnswerText,
          correct: mistake.correctAnswerText || "Opción Correcta",
          feedback: data.explanation || "Analiza el enunciado con atención para no volver a tropezar.",
        });
      } else {
        toast.error("No se pudo generar la retroalimentación de la IA.");
      }
    } catch (e) {
      toast.error("Error al conectar con la IA.");
    } finally {
      setLoadingAiId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-4 space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/50 p-6 rounded-3xl shadow-lg">
        <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Registro de Errores
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Revisa tus preguntas fallidas, vuelve a leer el pasaje o consulta la tutoría de IA para no volver a equivocarte.
          </p>
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <Target className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¡Excelente Trabajo, Cachimbo!</h2>
          <p className="text-slate-500 dark:text-slate-400">No tienes errores registrados recientemente. Tu racha de comprensión es impecable.</p>
          <Link href="/learn" className="inline-flex items-center mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20">
            Seguir Aprendiendo <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((mistake) => (
            <div 
              key={mistake.id} 
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-500 to-amber-500" />
              
              <div className="flex flex-col gap-4 pl-2">
                
                {/* Top Badge Info */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-black uppercase px-2.5 py-1 rounded-xl tracking-wider border border-rose-200 dark:border-rose-900">
                      {mistake.context}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(mistake.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="text-lg font-black text-slate-800 dark:text-white leading-snug">
                  {mistake.questionText}
                </div>

                {/* Answer Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-3.5 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider">Tu Respuesta</p>
                      <p className="font-bold text-sm text-rose-900 dark:text-rose-200">{mistake.wrongAnswerText}</p>
                    </div>
                  </div>
                  
                  {mistake.correctAnswerText && (
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-3.5 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Respuesta Correcta</p>
                        <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">{mistake.correctAnswerText}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Creative Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <Button
                    variant="secondaryOutline"
                    size="sm"
                    className="rounded-xl border-2 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs gap-2"
                    onClick={() => handleViewPassage(mistake)}
                    disabled={loadingPassageId === mistake.id}
                  >
                    {loadingPassageId === mistake.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4 text-indigo-500" />}
                    📖 Ver Pasaje de Lectura
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold text-xs gap-2 shadow-md shadow-amber-500/10"
                    onClick={() => handleRequestAiFeedback(mistake)}
                    disabled={loadingAiId === mistake.id}
                  >
                    {loadingAiId === mistake.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 fill-white" />}
                    🤖 Retroalimentación IA
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Pasaje de Lectura */}
      <Dialog open={!!selectedPassage} onOpenChange={() => setSelectedPassage(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xl">
              <BookOpen className="w-6 h-6" /> Pasaje de Lectura de la Pregunta
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Examina detenidamente el contexto del texto para reforzar tu comprensión.
            </DialogDescription>
          </DialogHeader>

          {selectedPassage && (
            <div className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-4 font-serif">
              {selectedPassage.text.split("\n\n").map((para, i) => (
                <p key={i} className="indent-4">{para}</p>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal 2: Retroalimentación IA */}
      <Dialog open={!!selectedAiFeedback} onOpenChange={() => setSelectedAiFeedback(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xl">
              <Sparkles className="w-6 h-6 fill-emerald-500" /> Tutoría & Retroalimentación IA
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Análisis pedagógico de tu respuesta para el examen de admisión.
            </DialogDescription>
          </DialogHeader>

          {selectedAiFeedback && (
            <div className="space-y-4 my-2">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300">
                <p className="text-slate-400 uppercase tracking-wider mb-1">Pregunta Auditada:</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedAiFeedback.question}</p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 p-5 rounded-2xl text-emerald-950 dark:text-emerald-200 text-sm leading-relaxed space-y-2">
                <p className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-base">
                  <Bot className="w-5 h-5 text-emerald-500" /> Explicación del Tutor IA:
                </p>
                <p className="font-medium text-sm leading-relaxed">{selectedAiFeedback.feedback}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};
