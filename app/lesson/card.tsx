import Image from "next/image";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

import { cn } from "@/lib/utils";
import type { Challenge } from "@prisma/client";

type Props = {
  id: number;
  imageSrc: string | null;
  audioSrc: string | null;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  is5050Disabled?: boolean;
  status?: "correct" | "wrong" | "none",
  type: Challenge["type"];
  isCorrect?: boolean;
  isAdmin?: boolean;
};

export const Card = ({
  id,
  imageSrc,
  audioSrc,
  text,
  shortcut,
  selected,
  onClick,
  status,
  disabled,
  is5050Disabled,
  type,
  isCorrect,
  isAdmin,
}: Props) => {
  const [audio, _, controls] = useAudio({ src: audioSrc || "" });

  const isCardDisabled = disabled || is5050Disabled;

  const handleClick = useCallback(() => {
    if (isCardDisabled) return;

    controls.play();
    onClick();
  }, [isCardDisabled, onClick, controls]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "border-2 rounded-xl border-b-4 p-4 cursor-pointer active:border-b-2 transition-all duration-150 relative",
        "hover:bg-neutral-50 hover:border-neutral-300 dark:hover:bg-slate-800/50",
        !selected && !isCardDisabled && "bg-card border-neutral-200 dark:border-slate-800",
        selected && "border-sky-400 bg-sky-50 hover:bg-sky-50 shadow-md shadow-sky-100 dark:bg-sky-950/40",
        selected && status === "correct" 
          && "border-green-400 bg-green-50 hover:bg-green-50 shadow-md shadow-green-100 dark:bg-green-950/40",
        selected && status === "wrong" 
          && "border-rose-400 bg-rose-50 hover:bg-rose-50 shadow-md shadow-rose-100 dark:bg-rose-950/40",
        isCardDisabled && "pointer-events-none opacity-50 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
        is5050Disabled && "line-through opacity-40 bg-slate-100/80 dark:bg-slate-900/80",
        isAdmin && isCorrect && !selected && "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20",
      )}
    >
      {audio}
      <div className="flex items-center gap-4">
        {/* Badge de letra */}
        <div className={cn(
          "w-9 h-9 rounded-lg border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
          !selected && "border-neutral-300 text-neutral-400 bg-neutral-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
          selected && "border-sky-400 text-sky-600 bg-sky-100 dark:bg-sky-900 dark:text-sky-200",
          selected && status === "correct" 
            && "border-green-400 text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200",
          selected && status === "wrong" 
            && "border-rose-400 text-rose-600 bg-rose-100 dark:bg-rose-900 dark:text-rose-200",
          is5050Disabled && "line-through border-slate-300 text-slate-300 bg-slate-200 dark:bg-slate-800 dark:text-slate-600",
          isAdmin && isCorrect && !selected && "border-emerald-400 text-emerald-600 bg-emerald-100 dark:bg-emerald-900",
        )}>
          {shortcut}
        </div>
        {/* Imagen si existe */}
        {imageSrc && (
          <div className="relative aspect-square max-h-[50px] w-[50px] shrink-0">
            <Image src={imageSrc} fill alt={text} className="rounded-lg" />
          </div>
        )}
        {/* Texto de la opción */}
        <p className={cn(
          "text-neutral-700 dark:text-slate-200 text-sm lg:text-base font-medium flex-1",
          selected && "text-sky-700 dark:text-sky-300",
          selected && status === "correct" && "text-green-700 dark:text-green-300",
          selected && status === "wrong" && "text-rose-700 dark:text-rose-300",
          is5050Disabled && "line-through text-slate-400 dark:text-slate-500",
          isAdmin && isCorrect && !selected && "text-emerald-700 dark:text-emerald-300",
        )}>
          {text}
        </p>

        {is5050Disabled && (
          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-full uppercase tracking-wider shrink-0">
            Descartada 50/50
          </span>
        )}

        {/* Admin badge: indicador de respuesta correcta */}
        {isAdmin && isCorrect && (
          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full shrink-0">
            ✓ Correcta
          </span>
        )}
      </div>
    </div>
  );
};
