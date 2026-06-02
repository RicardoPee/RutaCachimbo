"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitMockExam } from "@/actions/mock-exam-actions";
import { Timer, ArrowRight, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Question = any;

export const MockExamClient = ({ initialQuestions, universityId }: { initialQuestions: Question[], universityId?: string }) => {
  const router = useRouter();
  const [questions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [timeSpent, setTimeSpent] = useState(0);
  const [pending, startTransition] = useTransition();

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

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  const formatReferenceText = (text: string) => {
    if (!text) return null;
    let parsedText = text.replace(/\\n/g, '\n');
    
    // Auto-paragraphing for giant text blocks without newlines
    if (parsedText.length > 400 && !parsedText.includes('\n')) {
      const sentences = parsedText.match(/[^.!?]+[.!?]+/g) || [parsedText];
      let formatted = "";
      for (let i = 0; i < sentences.length; i++) {
        formatted += sentences[i].trim() + " ";
        if ((i + 1) % 4 === 0) formatted += "\n\n";
      }
      parsedText = formatted;
    }

    return parsedText.split('\n').map((paragraph, idx) => (
      paragraph.trim() ? <p key={idx} className="mb-6 indent-6">{paragraph.trim()}</p> : null
    ));
  };

  return (
    <div className="flex flex-col h-[85vh] w-full bg-white dark:bg-background rounded-3xl border-2 border-border shadow-sm overflow-hidden relative animate-in fade-in zoom-in duration-500">
      
      <div className="flex items-center justify-between p-4 border-b-2 border-slate-100 dark:border-border bg-muted">
        <div className="flex flex-col w-1/3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Progreso ({answeredCount}/{questions.length})</span>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        <div className={`flex items-center justify-center gap-2 px-6 py-2 rounded-2xl font-black text-xl border-2 ${timeLeft < 300 ? 'bg-rose-100 border-rose-300 text-rose-600 animate-pulse' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-foreground shadow-sm'}`}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>

        <div className="w-1/3 flex justify-end">
          <Button onClick={handleFinishExam} disabled={pending} variant="danger" className="font-bold">
            {pending ? "Analizando..." : "Entregar Examen"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {currentQuestion.referenceText && (
          <div className="flex-1 p-6 md:p-10 md:border-r-2 border-b-2 md:border-b-0 border-border overflow-y-auto bg-[#FDFDFD] dark:bg-[#0A0A0A] shadow-inner">
            <h2 className="text-2xl font-black text-foreground mb-6 border-b-4 border-border pb-4 inline-block">{currentQuestion.lessonTitle}</h2>
            <div className="text-slate-800 dark:text-slate-300 leading-[2.2] font-medium text-[16px] md:text-[18px] text-justify font-serif tracking-wide">
              {formatReferenceText(currentQuestion.referenceText)}
            </div>
          </div>
        )}

        <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 font-bold text-xs rounded-full uppercase tracking-widest mb-3">
              Pregunta {currentIndex + 1}
            </span>
            <h3 className="text-2xl font-black text-neutral-800 dark:text-neutral-100 leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="flex flex-col gap-3 flex-1 mt-4">
            {currentQuestion.challengeOptions.map((opt: any) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 ${
                    isSelected 
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 shadow-xl' 
                      : 'border-border hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground'
                  }`}
                >
                  <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-white bg-white text-slate-900 dark:border-slate-900 dark:bg-card dark:text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className={`font-semibold ${isSelected ? 'font-bold' : ''}`}>{opt.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 md:px-8 border-t-2 border-slate-100 dark:border-border bg-card">
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={handlePrev} 
          disabled={currentIndex === 0 || pending}
          className="font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Anterior
        </Button>
        
        <span className="text-sm font-bold text-slate-400 hidden md:block">
          Pregunta {currentIndex + 1} de {questions.length}
        </span>

        {currentIndex === questions.length - 1 ? (
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleFinishExam} 
            disabled={pending}
            className="font-bold shadow-sm"
          >
            Entregar Examen <Send className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleNext} 
            disabled={pending}
            className="font-bold shadow-sm"
          >
            Siguiente <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>

    </div>
  );
};
