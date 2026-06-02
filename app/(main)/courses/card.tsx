import { Check, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  id: number;
  imageSrc: string;
  onClick: (id: number) => void;
  disabled?: boolean;
  active?: boolean;
};

export const Card = ({
  title,
  id,
  disabled,
  onClick,
  active,
}: Props) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={cn(
        "h-full border-2 rounded-2xl border-b-4 hover:bg-neutral-50 dark:hover:bg-slate-800/50 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-4 pb-6 min-h-[220px] min-w-[200px] bg-card dark:border-border transition-all shadow-sm",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="min-[24px] w-full flex items-center justify-end">
        {active && (
          <div className="rounded-lg bg-green-500 flex items-center justify-center p-1.5 shadow-sm">
            <Check className="text-white stroke-[4] h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 shadow-sm ${
        active ? 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800'
      }`}>
        <BookOpen className={`w-12 h-12 ${active ? 'text-green-600 dark:text-green-500' : 'text-blue-500 dark:text-blue-400'}`} />
      </div>

      <p className="text-neutral-800 dark:text-neutral-100 text-center font-extrabold text-lg">
        {title}
      </p>
    </div>
  );
};
