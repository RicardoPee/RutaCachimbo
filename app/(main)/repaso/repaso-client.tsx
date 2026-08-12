"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Zap, Trophy, CheckCircle2, XCircle, Sparkles, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addRepasoXp } from "@/actions/game/repaso-actions";

type Option = {
  id: number;
  text: string;
  correct: boolean;
};

type Challenge = {
  id: number;
  question: string;
  type: string;
  lessonTitle: string;
  referenceText: string | null;
  challengeOptions: Option[];
};

type Props = {
  challenges: Challenge[];
};

export function RepasoClient({ challenges }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { width, height } = useWindowSize();
  const router = useRouter();

  if (challenges.length === 0) return null;

  const current = challenges[currentIndex];
  const progress = ((currentIndex) / challenges.length) * 100;
  const isSelectedCorrect = current.challengeOptions.find(o => o.id === selectedOptionId)?.correct || false;

  const handleSelect = (id: number) => {
    if (isAnswered) return;
    setSelectedOptionId(id);
  };

  const handleCheck = () => {
    if (!selectedOptionId || isAnswered) return;

    setIsAnswered(true);
    if (isSelectedCorrect) {
      setCorrectAnswersCount((c) => c + 1);
      toast.success("¡Respuesta correcta! 🎉");
    } else {
      toast.error("Respuesta incorrecta. ¡Sigue repasando! 💡");
    }
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setShowReference(false);
    } else {
      // Registrar XP al terminar: +5 XP por cada respuesta correcta
      const earnedXp = correctAnswersCount * 5;
      if (earnedXp > 0) {
        startTransition(async () => {
          const res = await addRepasoXp(earnedXp);
          if (res.error) {
            toast.error(res.error);
          } else {
            toast.success(`¡Se sumaron +${earnedXp} XP a tu perfil! 🔥`);
          }
          setCompleted(true);
        });
      } else {
        setCompleted(true);
      }
    }
  };

  const getOptionStyle = (opt: Option) => {
    if (!isAnswered) {
      return selectedOptionId === opt.id
        ? "border-primary bg-primary/10 text-primary"
        : "border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer";
    }

    // Ya verificado
    if (opt.correct) {
      return "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    }
    if (selectedOptionId === opt.id && !opt.correct) {
      return "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400";
    }
    return "border-border opacity-50";
  };

  if (completed) {
    const totalXp = correctAnswersCount * 5;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto p-8 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-3xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
        
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/80 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">¡Repaso Completado!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Has repasado <span className="font-extrabold text-slate-800 dark:text-white">{challenges.length} preguntas</span> con éxito.
          </p>
          <div className="flex justify-center items-center gap-6 mt-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-border">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Aciertos</p>
              <p className="text-xl font-black text-emerald-500">{correctAnswersCount} / {challenges.length}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Puntos Ganados</p>
              <p className="text-xl font-black text-amber-500">+{totalXp} XP</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full pt-4">
          <Button
            onClick={() => router.push("/learn")}
            className="w-full font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl py-6"
          >
            Volver al Temario
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOptionId(null);
              setIsAnswered(false);
              setCorrectAnswersCount(0);
              setCompleted(false);
              setShowReference(false);
            }}
            className="w-full font-bold text-muted-foreground rounded-2xl"
          >
            Volver a Intentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-12">
      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Repaso Rápido</span>
          <span>Pregunta {currentIndex + 1} de {challenges.length}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Lectura de Referencia (si existe en la lección de origen) */}
      {current.referenceText && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden">
          <button
            onClick={() => setShowReference((r) => !r)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-500" />
              Lectura: {current.lessonTitle}
            </span>
            {showReference ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showReference && (
            <div className="px-4 py-3 text-sm text-foreground/80 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap border-t border-border">
              {current.referenceText}
            </div>
          )}
        </div>
      )}

      {/* Tarjeta de Pregunta */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-snug">
          {current.question}
        </h3>

        {/* Opciones de respuesta */}
        <div className="space-y-3">
          {current.challengeOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-sm font-bold transition-all ${getOptionStyle(opt)} ${!isAnswered ? "select-none" : ""}`}
            >
              {isAnswered && opt.correct && (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              )}
              {isAnswered && selectedOptionId === opt.id && !opt.correct && (
                <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              {(!isAnswered || (opt.id !== selectedOptionId && !opt.correct)) && (
                <span className="w-5 h-5 shrink-0 border-2 rounded-full border-border" />
              )}
              <span>{opt.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de footer */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {!isAnswered ? (
          <Button
            onClick={handleCheck}
            disabled={!selectedOptionId}
            className="w-full rounded-2xl font-black py-6 uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 h-12 flex items-center justify-center"
          >
            Verificar Respuesta
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isPending}
            className="w-full rounded-2xl font-black py-6 uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 h-12 flex items-center justify-center gap-2"
          >
            {currentIndex === challenges.length - 1 ? "Terminar" : "Siguiente"} <ArrowRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
