import Image from "next/image";
import { redirect } from "next/navigation";
import { Target, Zap, Trophy, CheckCircle2, BookOpen, Flame, BrainCircuit } from "lucide-react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress, getUserSubscription, getDynamicQuests } from "@/db/queries";
import { Progress } from "@/components/ui/progress";
import { Promo } from "@/components/promo";

const QuestsPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const dynamicQuestsData = getDynamicQuests();

  const [
    userProgress,
    userSubscription,
    dynamicQuests,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    dynamicQuestsData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  const questIcons: Record<string, React.ReactNode> = {
    "XP": <Zap className="w-8 h-8 text-white" />,
    "EXAMS": <BookOpen className="w-8 h-8 text-white" />,
    "STREAK": <Flame className="w-8 h-8 text-white" />,
    "CHALLENGES": <BrainCircuit className="w-8 h-8 text-white" />,
  };

  const questColors: Record<string, { bg: string; border: string; completeBg: string; completeBorder: string; bar: string; completeBar: string }> = {
    "XP": { bg: "bg-yellow-500", border: "border-yellow-600", completeBg: "bg-green-500", completeBorder: "border-green-600", bar: "bg-yellow-500", completeBar: "bg-green-500" },
    "EXAMS": { bg: "bg-blue-500", border: "border-blue-600", completeBg: "bg-green-500", completeBorder: "border-green-600", bar: "bg-blue-500", completeBar: "bg-green-500" },
    "STREAK": { bg: "bg-orange-500", border: "border-orange-600", completeBg: "bg-green-500", completeBorder: "border-green-600", bar: "bg-orange-500", completeBar: "bg-green-500" },
    "CHALLENGES": { bg: "bg-purple-500", border: "border-purple-600", completeBg: "bg-green-500", completeBorder: "border-green-600", bar: "bg-purple-500", completeBar: "bg-green-500" },
  };

  const completedCount = dynamicQuests.filter(q => q.isCompleted).length;

  return ( 
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
          streak={userProgress.streak}
        />
        {!isPro && (
          <Promo />
        )}
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-full p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between shadow-lg mb-8">
            <div className="text-white space-y-2 text-center md:text-left mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                Misiones Semanales
              </div>
              <h1 className="font-extrabold text-3xl lg:text-4xl">
                Tus Objetivos
              </h1>
              <p className="text-white/90 text-lg font-medium max-w-[400px]">
                Completa misiones variadas antes del domingo a la medianoche para ganar recompensas.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Trophy className="w-5 h-5 text-yellow-100" />
                <span className="text-white/90 font-bold text-sm">{completedCount} de {dynamicQuests.length} completadas</span>
              </div>
            </div>
            <Image
              src="/quests.svg"
              alt="Quests"
              height={120}
              width={120}
              className="drop-shadow-2xl"
            />
          </div>

          <div className="w-full space-y-4">
            {dynamicQuests.map((quest) => {
              const colors = questColors[quest.type] || questColors["XP"];
              const icon = questIcons[quest.type] || questIcons["XP"];

              return (
                <div
                  className={`flex flex-col sm:flex-row items-start sm:items-center w-full p-6 gap-6 border-2 rounded-2xl transition-all ${
                    quest.isCompleted 
                      ? "border-green-400 bg-green-50 dark:bg-green-950/30" 
                      : "border-border bg-card hover:border-neutral-300 dark:hover:border-slate-700"
                  }`}
                  key={quest.title}
                >
                  <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border-2 ${
                    quest.isCompleted ? `${colors.completeBg} ${colors.completeBorder}` : `${colors.bg} ${colors.border}`
                  }`}>
                    {quest.isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      icon
                    )}
                  </div>

                  <div className="flex flex-col gap-y-3 w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className={`text-xl font-bold ${quest.isCompleted ? 'text-green-700 dark:text-green-400' : 'text-foreground'}`}>
                        {quest.title}
                      </p>
                      <p className={`font-extrabold text-sm ${quest.isCompleted ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                        {quest.currentValue} / {quest.value}
                      </p>
                    </div>
                    
                    <div className="relative w-full h-4 bg-neutral-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${
                          quest.isCompleted ? colors.completeBar : colors.bar
                        }`}
                        style={{ width: `${quest.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};
 
export default QuestsPage;
