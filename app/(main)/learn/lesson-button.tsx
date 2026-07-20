"use client";

import Link from "next/link";
import { Check, Crown, Star, Gift, Swords } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import "react-circular-progressbar/dist/styles.css";

type Props = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage
}: Props) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  const rightPosition = indentationLevel * 60;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;

  const isBoss = (index + 1) % 5 === 0;
  const isTreasure = (index + 1) % 3 === 0 && !isBoss;

  let Icon = isCompleted ? Check : Star;
  if (!isCompleted) {
    if (isLast) Icon = Crown;
    else if (isBoss) Icon = Swords;
    else if (isTreasure) Icon = Gift;
  }

  const href = isCompleted ? `/lesson/${id}` : "/lesson";

  let btnVariant = locked ? "locked" : "secondary";
  if (!locked && !isCompleted) {
    if (isBoss) btnVariant = "danger";
    else if (isTreasure) btnVariant = "primary";
  }

  return (
    <Link 
      href={href} 
      aria-disabled={locked} 
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      <div
        className="relative"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? 80 : 50,
        }}
      >
        {current ? (
          <div className="h-[102px] w-[102px] relative">
            <div className="absolute -top-10 left-[-15%] px-4 py-3 border-[3px] border-green-500/30 font-black uppercase text-white bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.4)] tracking-widest z-10">
              EMPEZAR
              <div
                className="absolute left-1/2 -bottom-[10px] w-0 h-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-emerald-400 transform -translate-x-1/2"
              />
            </div>
            <CircularProgressbarWithChildren
              value={Number.isNaN(percentage) ? 0 : percentage}
              styles={{
                path: {
                  stroke: "#4ade80",
                },
                trail: {
                  stroke: "#e5e7eb",
                },
              }}
            >
            <Button
              size="rounded"
              variant={btnVariant as any}
              className="h-[80px] w-[80px] border-b-8 shadow-xl shadow-green-500/30 hover:scale-[1.15] hover:shadow-2xl transition-all duration-300 animate-pulse-slow relative z-0"
            >
                <Icon
                  className={cn(
                    "h-10 w-10",
                    locked
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
                    isCompleted && "fill-none stroke-[4]"
                  )}
                />
              </Button>
            </CircularProgressbarWithChildren>
          </div>
        ) : (
          <Button
            size="rounded"
            variant={btnVariant as any}
            className={cn("h-[75px] w-[75px] border-b-8 transition-all duration-300 hover:scale-[1.12] hover:shadow-lg", 
               locked ? "shadow-inner opacity-70" : "shadow-md" 
            )}
          >
            <Icon
              className={cn(
                "h-10 w-10",
                locked
                ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                : "fill-primary-foreground text-primary-foreground",
                isCompleted && "fill-none stroke-[4]"
              )}
            />
          </Button>
        )}
      </div>
    </Link>
  );
};
