import Image from "next/image";
import { redirect } from "next/navigation";
import { Target, Zap, Trophy, CheckCircle2 } from "lucide-react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress, getUserSubscription, getCompletedChallengesCount } from "@/db/queries";
import { Progress } from "@/components/ui/progress";
import { Promo } from "@/components/promo";
import { quests } from "@/constants";

const QuestsPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  const [
    userProgress,
    userSubscription,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

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
                Acumula XP antes del domingo a la medianoche para ascender de liga y reclamar tus recompensas.
              </p>
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
            {quests.map((quest) => {
              const currentValue = userProgress.weeklyPoints;
              const progressPercentage = Math.min((currentValue / quest.value) * 100, 100);
              const isCompleted = progressPercentage >= 100;

              return (
                <div
                  className={`flex flex-col sm:flex-row items-start sm:items-center w-full p-6 gap-6 border-2 rounded-2xl transition-all ${
                    isCompleted 
                      ? "border-green-400 bg-green-50 dark:bg-green-950/30" 
                      : "border-border bg-card hover:border-neutral-300 dark:hover:border-slate-700"
                  }`}
                  key={quest.title}
                >
                  <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border-2 ${
                    isCompleted ? "bg-green-500 border-green-600" : "bg-yellow-500 border-yellow-600"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <Zap className="w-8 h-8 text-white" />
                    )}
                  </div>

                  <div className="flex flex-col gap-y-3 w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className={`text-xl font-bold ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-foreground'}`}>
                        {quest.title}
                      </p>
                      <p className={`font-extrabold text-sm ${isCompleted ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                        {currentValue} / {quest.value} XP
                      </p>
                    </div>
                    
                    <div className="relative w-full h-4 bg-neutral-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${
                          isCompleted ? "bg-green-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${progressPercentage}%` }}
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
