import { MascotAvatar } from "@/components/mascot-avatar";

type Props = {
  question: string;
  activeMascotSkin?: string | null;
};

export const QuestionBubble = ({ question, activeMascotSkin = "default" }: Props) => {
  return (
    <div className="flex items-center gap-x-4 mb-6">
      <MascotAvatar
        skinId={activeMascotSkin}
        height={60}
        width={60}
        className="hidden lg:flex shrink-0"
      />
      <MascotAvatar
        skinId={activeMascotSkin}
        height={40}
        width={40}
        className="flex lg:hidden shrink-0"
      />
      <div className="relative py-2 px-4 border-2 border-slate-200 dark:border-slate-800 bg-card rounded-2xl text-sm lg:text-base font-semibold text-foreground shadow-sm">
        {question}
        <div
          className="absolute -left-3 top-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-200 dark:border-t-slate-800 transform -translate-y-1/2 rotate-90"
        />
      </div>
    </div>
  );
};
