import Link from "next/link";
import { BookMarked, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
};

export const UnitBanner = ({
  title,
  description,
}: Props) => {
  return (
    <div className="w-full rounded-2xl bg-card border-2 border-b-4 border-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 opacity-5 dark:opacity-10 pointer-events-none">
        <BookMarked className="w-64 h-64 text-green-500" />
      </div>

      <div className="flex items-start gap-4 z-10">
        <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-3 rounded-xl border-2 border-green-200 dark:border-green-800 hidden sm:block">
          <BookMarked className="w-8 h-8 text-green-600 dark:text-green-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-green-500 dark:text-green-400 uppercase tracking-widest">
            {title}
          </h3>
          <p className="text-xl md:text-2xl font-extrabold text-neutral-800 dark:text-neutral-100">
            {description}
          </p>
        </div>
      </div>
      
      <Link href="/lesson" className="w-full md:w-auto z-10">
        <Button
          size="lg"
          className="w-full md:w-auto border-2 border-b-4 active:border-b-2 bg-green-500 hover:bg-green-600 text-white"
        >
          <PlayCircle className="mr-2 w-5 h-5" />
          Reanudar Lectura
        </Button>
      </Link>
    </div>
  );
};
