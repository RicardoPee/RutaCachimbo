"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lesson = {
  id: number;
  title: string;
};

type Props = {
  lessons: Lesson[];
};

export function VocabSelectClient({ lessons }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const router = useRouter();

  const handleStudy = () => {
    if (!selectedId) return;
    router.push(`/vocabulario/${selectedId}`);
  };

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5 text-sky-500" /> Vocabulario por IA
      </p>
      
      <div className="flex gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
        >
          <option value="" disabled>Selecciona lectura...</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
        
        <Button
          onClick={handleStudy}
          disabled={!selectedId}
          size="sm"
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold px-3 h-8 shadow-sm"
        >
          Estudiar
        </Button>
      </div>
    </div>
  );
}
