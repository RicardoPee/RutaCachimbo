"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, BookOpen, Trophy, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Word = {
  id: number;
  word: string;
  definition: string;
  context: string;
};

type Props = {
  words: Word[];
  lessonTitle: string;
};

export function VocabClient({ words, lessonTitle }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { width, height } = useWindowSize();
  const router = useRouter();

  if (words.length === 0) return null;

  const current = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto p-8 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-3xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
        
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/80 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">¡Vocabulario Completado!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Has repasado todas las palabras clave de la lección <span className="font-extrabold text-slate-800 dark:text-white">"{lessonTitle}"</span>. ¡Excelente esfuerzo por ampliar tu léxico!
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full pt-4">
          <Button
            onClick={() => router.push("/learn")}
            className="w-full font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-6"
          >
            Volver al Temario
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCompleted(false);
              setCurrentIndex(0);
            }}
            className="w-full font-bold text-muted-foreground rounded-2xl"
          >
            Repasar de Nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pb-12">
      {/* Barra de progreso superior */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Vocabulario</span>
          <span>Tarjeta {currentIndex + 1} de {words.length}</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tarjeta Giratoria 3D */}
      <div
        onClick={handleFlip}
        className="w-full h-96 relative cursor-pointer select-none group [perspective:1000px]"
      >
        <div
          className={`w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* LADO FRONTAL (Palabra y Contexto) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl border-2 border-sky-100 dark:border-slate-800 bg-gradient-to-b from-white to-sky-50/20 dark:from-slate-900 dark:to-slate-950 p-8 flex flex-col justify-between shadow-xl backface-hidden [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                Término
              </span>
              <RotateCw className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform" />
            </div>

            <div className="space-y-6 my-auto text-center">
              <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                {current.word}
              </h3>
              
              {current.context && (
                <div className="max-w-md mx-auto">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Contexto del Texto</p>
                  <p className="text-xs md:text-sm text-foreground/80 italic leading-relaxed whitespace-pre-wrap">
                    "{current.context}"
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground/60 font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Haz clic para ver el significado
            </div>
          </div>

          {/* LADO TRASERO (Definición) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl border-2 border-indigo-200 dark:border-slate-800 bg-gradient-to-b from-white to-indigo-50/20 dark:from-slate-900 dark:to-slate-950 p-8 flex flex-col justify-between shadow-xl [transform:rotateY(180deg)] backface-hidden [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                Significado
              </span>
              <RotateCw className="w-4 h-4 text-slate-400 group-hover:-rotate-45 transition-transform" />
            </div>

            <div className="space-y-4 my-auto text-center px-4">
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">
                {current.word}
              </h4>
              <p className="text-sm md:text-base text-foreground leading-relaxed max-w-md mx-auto">
                {current.definition}
              </p>
            </div>

            <div className="text-center text-xs text-muted-foreground/60 font-semibold">
              Haz clic para regresar al término
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Navegación */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          variant="secondaryOutline"
          className="rounded-2xl flex-1 font-bold h-12 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        
        <Button
          onClick={handleNext}
          className="rounded-2xl flex-1 font-bold h-12 bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
        >
          {currentIndex === words.length - 1 ? "Terminar" : "Siguiente"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
