"use client";

import { useState, useTransition } from "react";
import { Zap, CheckCircle2, XCircle, Trophy, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { submitDailyChallenge } from "@/actions/game/daily-challenge-actions";

type Option = {
  id: number;
  text: string;
  isCorrect?: boolean;
};

type DailyChallengeData = {
  id: number;
  question: string;
  referenceText: string | null;
  lessonTitle: string;
  options: Option[];
};

type Props = {
  challenge: DailyChallengeData;
  alreadyClaimed: boolean;
  claimResult: { correct: boolean; xpEarned: number } | null;
  date: string;
  xpBonus: number;
};

export function DailyChallengeCard({ challenge, alreadyClaimed, claimResult, date, xpBonus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    xpEarned: number;
    correctOptionId: number;
    correctOptionText: string;
  } | null>(null);
  const [showText, setShowText] = useState(false);

  const answered = alreadyClaimed || !!result;
  const finalResult = result ?? claimResult;

  const handleSelect = (optionId: number) => {
    if (answered || isPending) return;
    setSelectedId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedId || answered) return;

    startTransition(async () => {
      const res = await submitDailyChallenge(challenge.id, selectedId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.success) {
        setResult({
          correct: res.correct!,
          xpEarned: res.xpEarned!,
          correctOptionId: res.correctOptionId!,
          correctOptionText: res.correctOptionText!,
        });
        if (res.correct) {
          toast.success(`¡Correcto! +${res.xpEarned} XP 🔥`);
        } else {
          toast.error("Incorrecto. ¡Mañana habrá otra oportunidad!");
        }
      }
    });
  };

  const getOptionStyle = (opt: Option) => {
    if (!answered) {
      return selectedId === opt.id
        ? "border-primary bg-primary/10 text-primary"
        : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
    }
    // Ya respondido
    const isCorrect = result
      ? opt.id === result.correctOptionId
      : opt.isCorrect === true;
    const isSelected = selectedId === opt.id;

    if (isCorrect) return "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    if (isSelected && !isCorrect) return "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400";
    return "border-border opacity-50";
  };

  return (
    <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-b from-amber-50/60 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400/20">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Reto del Día
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Se renueva a medianoche
            </p>
          </div>
        </div>
        {!answered && (
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
            +{xpBonus} XP
          </span>
        )}
        {finalResult?.correct && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> +{finalResult.xpEarned} XP
          </span>
        )}
        {answered && !finalResult?.correct && (
          <span className="text-xs text-muted-foreground">Completado</span>
        )}
      </div>

      {/* Texto de referencia (colapsable) */}
      {challenge.referenceText && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 overflow-hidden">
          <button
            onClick={() => setShowText((s) => !s)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              {challenge.lessonTitle}
            </span>
            {showText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showText && (
            <div className="px-3 py-2 text-xs text-foreground/80 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
              {challenge.referenceText}
            </div>
          )}
        </div>
      )}

      {/* Pregunta */}
      <p className="text-sm font-semibold text-foreground leading-snug">
        {challenge.question}
      </p>

      {/* Opciones */}
      <div className="space-y-1.5">
        {challenge.options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className={`relative flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${getOptionStyle(opt)} ${!answered ? "select-none" : ""}`}
          >
            {answered && (opt.id === result?.correctOptionId || opt.isCorrect) && (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            )}
            {answered && selectedId === opt.id && opt.id !== result?.correctOptionId && !opt.isCorrect && (
              <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            )}
            {(!answered || (opt.id !== result?.correctOptionId && !opt.isCorrect && selectedId !== opt.id)) && (
              <span className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{opt.text}</span>
          </div>
        ))}
      </div>

      {/* Botón */}
      {!answered && (
        <Button
          size="sm"
          disabled={!selectedId || isPending}
          onClick={handleSubmit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-8 rounded-lg"
        >
          {isPending ? "Enviando..." : "Responder"}
        </Button>
      )}

      {answered && finalResult && (
        <div className={`text-center text-xs font-semibold py-1 rounded-lg ${finalResult.correct ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {finalResult.correct
            ? "¡Excelente! Vuelve mañana para otro reto."
            : "Mañana hay otra oportunidad. ¡No te rindas!"}
        </div>
      )}
    </div>
  );
}
