import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuestItem = {
  title: string;
  value: number;
  currentValue: number;
  isCompleted: boolean;
  progressPercentage: number;
  type: string;
};

type Props = {
  quests: QuestItem[];
};

export const Quests = ({ quests }: Props) => {
  return (
    <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-card shadow-sm space-y-4">
      <div className="flex items-center justify-between w-full">
        <h3 className="font-extrabold text-base text-neutral-700 dark:text-neutral-200">
          Misiones Semanales
        </h3>
        <Link href="/quests">
          <Button
            size="sm"
            variant="primaryOutline"
            className="h-8 text-[11px] font-bold"
          >
            Ver todas
          </Button>
        </Link>
      </div>
      <ul className="w-full space-y-3.5">
        {quests.map((quest) => {
          return (
            <div
              className="flex items-center w-full gap-x-3 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900"
              key={quest.title}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
                quest.isCompleted ? "bg-green-500 border-green-600 text-white" : "bg-yellow-500 border-yellow-600 text-white"
              }`}>
                {quest.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Zap className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div className="flex flex-col gap-y-1.5 w-full min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <p className="text-neutral-700 dark:text-neutral-200 text-xs font-bold truncate">
                    {quest.title}
                  </p>
                  <span className="text-[9px] font-extrabold shrink-0 text-muted-foreground">
                    {quest.currentValue} / {quest.value}
                  </span>
                </div>
                <div className="relative w-full h-2 bg-neutral-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-700 ${
                      quest.isCompleted ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${quest.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
};
