import Image from "next/image";
import { redirect } from "next/navigation";
import { Trophy, CheckCircle2, Lock, Brain, Flame, Diamond, BookOpen, Crown } from "lucide-react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { Promo } from "@/components/promo";

const ACHIEVEMENTS = [
  { id: "perfect_score", title: "Cerebro Intocable", description: "Obtén un puntaje perfecto en un simulacro.", icon: Brain, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/50" },
  { id: "streak_7", title: "Llama Imparable", description: "Mantén una racha de 7 días seguidos.", icon: Flame, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/50" },
  { id: "elite_league", title: "Mente de Élite", description: "Asciende a la Liga Oro o superior.", icon: Diamond, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/50" },
  { id: "reader_10", title: "Lector Voraz", description: "Completa 10 lecciones.", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/50" },
  { id: "first_blood", title: "Primer Paso", description: "Gana tus primeros 10 puntos de experiencia.", icon: Crown, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/50" },
];

const LogrosPage = async () => {
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
  
  const unlocked = new Set(userProgress.unlockedAchievements);
  
  // Auto-desbloqueo de logros que se pueden calcular en tiempo real si aún no están guardados
  if (userProgress.streak >= 7) unlocked.add("streak_7");
  if (userProgress.league === "ORO" || userProgress.league === "DIAMANTE") unlocked.add("elite_league");
  if (userProgress.points >= 10) unlocked.add("first_blood");

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
          
          <div className="bg-gradient-to-br from-yellow-300 to-amber-500 w-full p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between shadow-lg mb-8">
            <div className="text-white space-y-2 text-center md:text-left mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                Sala de Trofeos
              </div>
              <h1 className="font-extrabold text-3xl lg:text-4xl">
                Tus Logros
              </h1>
              <p className="text-white/90 text-lg font-medium max-w-[400px]">
                Desbloquea medallas épicas superando retos difíciles. ¡Demuestra que eres un cachimbo de élite!
              </p>
            </div>
            <div className="relative">
              <Trophy className="w-32 h-32 text-yellow-100 drop-shadow-2xl opacity-90" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlocked.has(achievement.id);
              const Icon = achievement.icon;

              return (
                <div
                  className={`flex flex-col p-6 border-2 rounded-2xl transition-all ${
                    isUnlocked 
                      ? "border-amber-200 bg-card shadow-sm" 
                      : "border-border bg-muted/50 opacity-60 grayscale hover:grayscale-0 cursor-not-allowed"
                  }`}
                  key={achievement.id}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${isUnlocked ? achievement.bg : "bg-neutral-200 dark:bg-slate-800"}`}>
                      <Icon className={`w-7 h-7 ${isUnlocked ? achievement.color : "text-neutral-400"}`} />
                    </div>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? "text-neutral-800 dark:text-neutral-100" : "text-neutral-500"}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};
 
export default LogrosPage;
