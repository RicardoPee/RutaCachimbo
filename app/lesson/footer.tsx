import { useKey, useMedia } from "react-use";
import { CheckCircle, XCircle, Bot, MessageSquare, Sparkles, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  explanation?: string | null;
  isExplaining?: boolean;
  onOpenTutor?: () => void;
  onRequestExplanation?: () => void;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  explanation,
  isExplaining,
  onOpenTutor,
  onRequestExplanation,
}: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer className={cn(
      "min-h-[100px] lg:min-h-[120px] transition-all duration-300 py-4 px-4 lg:px-10",
      status === "none" && "bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50",
      status === "correct" && "border-t-2 border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/50",
      status === "wrong" && "border-t-2 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50",
      status === "completed" && "bg-transparent border-none"
    )}>
      <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status indicator & AI Explanation */}
        <div className="flex-1 w-full">
          {status === "correct" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-green-600 dark:text-green-400 font-black text-base lg:text-xl flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 lg:h-7 lg:w-7 text-green-500 shrink-0" />
                  <span>¡Excelente! Respuesta Correcta</span>
                </div>
                {!explanation && !isExplaining && onRequestExplanation && (
                  <button
                    onClick={onRequestExplanation}
                    className="flex items-center gap-1 text-xs font-bold bg-green-200/80 dark:bg-green-900/60 text-green-800 dark:text-green-200 px-3 py-1 rounded-xl hover:bg-green-300/80 transition-colors shadow-sm"
                  >
                    <HelpCircle className="w-4 h-4" /> 💡 Ver Explicación IA
                  </button>
                )}
              </div>
              
              {/* Explicación IA bajo demanda */}
              {(explanation || isExplaining) && (
                <div className="bg-white/90 dark:bg-slate-900/90 border border-green-200 dark:border-green-800/80 p-3 lg:p-4 rounded-2xl shadow-sm text-xs lg:text-sm text-slate-800 dark:text-slate-200 max-h-[140px] overflow-y-auto space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-emerald-500" />
                      Explicación del Tutor IA
                    </span>
                    {onOpenTutor && (
                      <button
                        onClick={onOpenTutor}
                        className="flex items-center gap-1 text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors font-extrabold"
                      >
                        <MessageSquare className="w-3 h-3" /> Chatear con IA
                      </button>
                    )}
                  </div>
                  {isExplaining && !explanation ? (
                    <div className="flex items-center gap-2 text-slate-400 font-medium py-1 animate-pulse">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                      <span>Cargando explicación de la base de datos...</span>
                    </div>
                  ) : (
                    <p className="leading-relaxed font-medium whitespace-pre-line">
                      {explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {status === "wrong" && (
            <div className="space-y-2">
              <div className="text-rose-600 dark:text-rose-400 font-black text-base lg:text-xl flex items-center gap-2">
                <XCircle className="h-6 w-6 lg:h-7 lg:w-7 text-rose-500 shrink-0" />
                <span>Respuesta Incorrecta</span>
              </div>

              {/* Explicación IA */}
              {(explanation || isExplaining) && (
                <div className="bg-white/90 dark:bg-slate-900/90 border border-rose-200 dark:border-rose-800/80 p-3 lg:p-4 rounded-2xl shadow-sm text-xs lg:text-sm text-slate-800 dark:text-slate-200 max-h-[140px] overflow-y-auto space-y-2">
                  <div className="flex items-center justify-between font-bold text-rose-600 dark:text-rose-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-rose-500" />
                      Retroalimentación de IA (DB Cache)
                    </span>
                    {onOpenTutor && (
                      <button
                        onClick={onOpenTutor}
                        className="flex items-center gap-1 text-[11px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full hover:bg-rose-200 transition-colors font-extrabold"
                      >
                        <MessageSquare className="w-3 h-3" /> Analizar con Tutor IA
                      </button>
                    )}
                  </div>
                  {isExplaining && !explanation ? (
                    <div className="flex items-center gap-2 text-slate-400 font-medium py-1 animate-pulse">
                      <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
                      <span>Obteniendo explicación de la base de datos...</span>
                    </div>
                  ) : (
                    <p className="leading-relaxed font-medium whitespace-pre-line">
                      {explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {status === "completed" && (
            <Button
              variant="default"
              size={isMobile ? "sm" : "lg"}
              onClick={() => window.location.href = `/lesson/${lessonId}`}
            >
              Practicar de nuevo
            </Button>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2">
          <Button
            disabled={disabled}
            onClick={onCheck}
            size={isMobile ? "sm" : "lg"}
            variant={status === "wrong" ? "danger" : "secondary"}
            className="font-extrabold text-sm lg:text-base px-6 lg:px-8 shadow-md"
          >
            {status === "none" && "Comprobar"}
            {status === "correct" && "Siguiente"}
            {status === "wrong" && "Reintentar"}
            {status === "completed" && "Continuar"}
          </Button>
        </div>

      </div>
    </footer>
  );
};
