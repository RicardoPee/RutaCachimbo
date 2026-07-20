"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitMockExam } from "@/actions/mock-exam-actions";
import { Timer, ArrowRight, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ReadingPassageReader } from "@/components/reading-passage-reader";

type Question = any;

export const MockExamClient = ({ initialQuestions, universityId }: { initialQuestions: Question[], universityId?: string }) => {
  const router = useRouter();
  const [questions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [timeSpent, setTimeSpent] = useState(0);
  const [pending, startTransition] = useTransition();

  const handleFinishExam = () => {
    if (pending) return;
    startTransition(() => {
      toast.info("Enviando examen y analizando resultados con IA...", { duration: 5000 });
      submitMockExam({
        answers,
        timeSpent,
        questions,
        universityId
      }).then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else if (res.success && res.resultId) {
          toast.success("Examen completado. Generando reporte...");
          router.push(`/simulacros/report/${res.resultId}`);
        }
      }).catch(() => toast.error("Error crítico al enviar."));
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (optionId: number) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: optionId });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="flex flex-col h-[85vh] w-full bg-slate-900/5 dark:bg-background/80 glass-card rounded-3xl border-2 border-border shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 px-6 md:px-10 border-b-2 border-slate-200/50 dark:border-border bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <div className="flex flex-col w-1/3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            Progreso <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{answeredCount}/{questions.length}</span>
          </span>
          <Progress value={progressPercent} className="h-2.5 bg-slate-200 dark:bg-slate-800" />
        </div>
        
        <div className={`flex items-center justify-center gap-3 px-8 py-2.5 rounded-2xl font-black text-2xl border-2 shadow-sm transition-all duration-300 ${timeLeft < 300 ? 'bg-rose-500/10 border-rose-400 text-rose-600 animate-pulse-glow shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'glass-card border-slate-300 dark:border-slate-700 text-foreground'}`}>
          <Timer className="w-6 h-6" />
          {formatTime(timeLeft)}
        </div>

        <div className="w-1/3 flex justify-end">
          <Button onClick={handleFinishExam} disabled={pending} variant="danger" size="lg" className="font-bold shadow-lg">
            {pending ? "Analizando..." : "Entregar Examen"}
          </Button>
        </div>
      </div>

      {/* BODY SPLIT VIEW */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-transparent p-4 gap-4 overflow-hidden">
        
        {/* LECTURA STICKY */}
        {currentQuestion.referenceText && (
          <div className="flex-1 h-full min-h-0">
            <ReadingPassageReader 
              text={currentQuestion.referenceText} 
              title={currentQuestion.lessonTitle || "Texto de Lectura del Simulacro"} 
            />
          </div>
        )}

        {/* PREGUNTAS Y OPCIONES */}
        <div className="flex-1 p-4 md:p-6 flex flex-col overflow-y-auto bg-transparent relative custom-scrollbar">
          
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-400 to-sky-400 text-white font-bold text-xs rounded-full uppercase tracking-widest mb-3 shadow-sm">
              Pregunta {currentIndex + 1}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-neutral-800 dark:text-neutral-100 leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="flex flex-col gap-3 flex-1 mt-2">
            {currentQuestion.challengeOptions.map((opt: any) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:bg-emerald-900/30' 
                      : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800 text-muted-foreground glass-card'
                  }`}
                >
                  <div className={`w-8 h-8 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white shadow-md' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400 group-hover:text-emerald-500'}`}>
                    {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{opt.id.toString().slice(-1)}</span>}
                  </div>
                  <span className={`font-semibold text-base ${isSelected ? 'font-black' : ''}`}>{opt.text}</span>
                  
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl animate-pulse-glow pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="flex items-center justify-between p-4 md:px-10 border-t-2 border-slate-200/50 dark:border-border bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={handlePrev} 
          disabled={currentIndex === 0 || pending}
          className="font-bold shadow-md rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Anterior
        </Button>
        
        <span className="text-sm font-bold text-slate-500 hidden md:flex items-center gap-2">
          Pregunta <span className="text-emerald-600 dark:text-emerald-400 text-lg">{currentIndex + 1}</span> de {questions.length}
        </span>

        {currentIndex === questions.length - 1 ? (
          <Button 
            variant="super" 
            size="lg" 
            onClick={handleFinishExam} 
            disabled={pending}
            className="font-bold shadow-xl rounded-xl"
          >
            Entregar Examen <Send className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleNext} 
            disabled={pending}
            className="font-bold shadow-xl rounded-xl"
          >
            Siguiente <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>

    </div>
  );
};
