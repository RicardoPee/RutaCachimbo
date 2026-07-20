"use client";

import { useState } from "react";
import { BookOpen, ZoomIn, ZoomOut, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  title?: string;
  className?: string;
};

const FONT_SIZES = [
  { label: "S", class: "text-sm leading-relaxed" },
  { label: "M", class: "text-base leading-relaxed" },
  { label: "L", class: "text-lg leading-loose" },
  { label: "XL", class: "text-xl leading-loose" },
];

export const ReadingPassageReader = ({
  text,
  title = "Texto de Lectura",
  className,
}: Props) => {
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // Default M (text-base)

  const wordCount = text ? text.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const paragraphs = text
    ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [];

  const handleZoomIn = () => {
    setFontSizeIndex((prev) => Math.min(prev + 1, FONT_SIZES.length - 1));
  };

  const handleZoomOut = () => {
    setFontSizeIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-foreground",
      className
    )}>
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-3.5 px-5 border-b-2 border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-neutral-800 dark:text-white flex items-center gap-1.5">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" /> {wordCount} palabras
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <Clock className="w-3 h-3" /> ~{readingTimeMinutes} min de lectura
              </span>
            </div>
          </div>
        </div>

        {/* Font Size Zoom Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-sm">
          <Button
            type="button"
            onClick={handleZoomOut}
            disabled={fontSizeIndex === 0}
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            title="Reducir letra"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          <span className="text-xs font-black px-1 text-slate-700 dark:text-slate-200 min-w-[18px] text-center">
            {FONT_SIZES[fontSizeIndex].label}
          </span>

          <Button
            type="button"
            onClick={handleZoomIn}
            disabled={fontSizeIndex === FONT_SIZES.length - 1}
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            title="Aumentar letra"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Reader Body Content */}
      <div className="flex-1 p-5 lg:p-6 overflow-y-auto custom-scrollbar space-y-4 font-normal">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, idx) => (
            <p
              key={idx}
              className={cn(
                "text-slate-800 dark:text-slate-200 font-serif tracking-normal text-justify select-text leading-relaxed",
                FONT_SIZES[fontSizeIndex].class
              )}
            >
              {para.trim()}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground text-sm italic text-center py-10">
            No se encontró un texto de referencia para esta lección.
          </p>
        )}
      </div>
    </div>
  );
};
