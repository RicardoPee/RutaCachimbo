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
  type,
  isCorrect,
  isAdmin,
}: Props) => {
  const [audio, _, controls] = useAudio({ src: audioSrc || "" });

  const handleClick = useCallback(() => {
    if (disabled) return;

    controls.play();
    onClick();
  }, [disabled, onClick, controls]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "border-2 rounded-xl border-b-4 p-4 cursor-pointer active:border-b-2 transition-all duration-150 relative",
        "hover:bg-neutral-50 hover:border-neutral-300",
        !selected && !disabled && "bg-white border-neutral-200",
        selected && "border-sky-400 bg-sky-50 hover:bg-sky-50 shadow-md shadow-sky-100",
        selected && status === "correct" 
          && "border-green-400 bg-green-50 hover:bg-green-50 shadow-md shadow-green-100",
        selected && status === "wrong" 
          && "border-rose-400 bg-rose-50 hover:bg-rose-50 shadow-md shadow-rose-100",
        disabled && "pointer-events-none opacity-80",
        // Admin: borde sutil verde en la respuesta correcta
        isAdmin && isCorrect && !selected && "border-emerald-300 bg-emerald-50/40",
      )}
    >
      {audio}
      <div className="flex items-center gap-4">
        {/* Badge de letra */}
        <div className={cn(
          "w-9 h-9 rounded-lg border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
          !selected && "border-neutral-300 text-neutral-400 bg-neutral-50",
          selected && "border-sky-400 text-sky-600 bg-sky-100",
          selected && status === "correct" 
            && "border-green-400 text-green-600 bg-green-100",
          selected && status === "wrong" 
            && "border-rose-400 text-rose-600 bg-rose-100",
          // Admin: badge verde en la correcta
          isAdmin && isCorrect && !selected && "border-emerald-400 text-emerald-600 bg-emerald-100",
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
          "text-neutral-700 text-sm lg:text-base font-medium flex-1",
          selected && "text-sky-700",
          selected && status === "correct" && "text-green-700",
          selected && status === "wrong" && "text-rose-700",
          isAdmin && isCorrect && !selected && "text-emerald-700",
        )}>
          {text}
        </p>
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
