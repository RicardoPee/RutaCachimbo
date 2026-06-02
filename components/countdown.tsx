"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  targetDate: Date;
  className?: string;
}

export const Countdown = ({ targetDate, className }: CountdownProps) => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(intervalId);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className={cn("flex select-none items-center justify-center gap-3 sm:gap-5 md:gap-7", className)}>
      <div className="flex flex-col items-center gap-1">
        <span className="font-cinzel text-3xl font-bold tabular-nums text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] sm:text-4xl md:text-5xl">
          {timeLeft.days.toString().padStart(2, "0")}
        </span>
        <span className="font-cinzel text-[0.55rem] font-semibold tracking-[0.3em] text-neutral-400 dark:text-white/40 sm:text-[0.65rem]">DÍAS</span>
      </div>
      <span className="self-start mt-1 font-cinzel text-2xl font-light text-yellow-500/30 sm:text-3xl md:text-4xl">:</span>
      
      <div className="flex flex-col items-center gap-1">
        <span className="font-cinzel text-3xl font-bold tabular-nums text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] sm:text-4xl md:text-5xl">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="font-cinzel text-[0.55rem] font-semibold tracking-[0.3em] text-neutral-400 dark:text-white/40 sm:text-[0.65rem]">HORAS</span>
      </div>
      <span className="self-start mt-1 font-cinzel text-2xl font-light text-yellow-500/30 sm:text-3xl md:text-4xl">:</span>
      
      <div className="flex flex-col items-center gap-1">
        <span className="font-cinzel text-3xl font-bold tabular-nums text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] sm:text-4xl md:text-5xl">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="font-cinzel text-[0.55rem] font-semibold tracking-[0.3em] text-neutral-400 dark:text-white/40 sm:text-[0.65rem]">MIN</span>
      </div>
      <span className="self-start mt-1 font-cinzel text-2xl font-light text-yellow-500/30 sm:text-3xl md:text-4xl">:</span>
      
      <div className="flex flex-col items-center gap-1">
        <span className="font-cinzel text-3xl font-bold tabular-nums text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] sm:text-4xl md:text-5xl">
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        <span className="font-cinzel text-[0.55rem] font-semibold tracking-[0.3em] text-neutral-400 dark:text-white/40 sm:text-[0.65rem]">SEG</span>
      </div>
    </div>
  );
};
