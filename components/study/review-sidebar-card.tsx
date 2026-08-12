import Link from "next/link";
import { Zap, Swords, GraduationCap } from "lucide-react";

import { getCompletedLessons } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { VocabSelectClient } from "./vocab-select-client";

export async function ReviewSidebarCard() {
  const completedLessons = await getCompletedLessons();

  // Ocultar el widget si no hay contenido completado para repasar
  if (completedLessons.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
          <Zap className="w-4 h-4 fill-amber-500" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200">
            Centro de Repaso
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Refuerza tus temas completados
          </p>
        </div>
      </div>

      {/* Botón de Repaso Rápido */}
      <Link href="/repaso" className="block w-full">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          Iniciar Repaso Rápido
        </Button>
      </Link>

      {/* Selector de Vocabulario por IA */}
      <VocabSelectClient lessons={completedLessons} />
    </div>
  );
}
