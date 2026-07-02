import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getTopTenUsers, getUserProgress, getUserSubscription } from "@/db/queries";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { LeaderboardClient } from "@/components/leaderboard-client";

const LearderboardPage = async () => {
  const { userId } = auth();
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const leaderboardAllTimeData = getTopTenUsers("ALL_TIME");
  const leaderboardWeeklyData = getTopTenUsers("WEEKLY");

  const [
    userProgress,
    userSubscription,
    leaderboardAllTime,
    leaderboardWeekly,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    leaderboardAllTimeData,
    leaderboardWeeklyData,
  ]);

  if (!userProgress || !userProgress.activeCourse || !userId) {
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
        <Quests points={userProgress.weeklyPoints} />
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/leaderboard.svg"
            alt="Leaderboard"
            height={90}
            width={90}
          />
          <h1 className="text-center font-bold text-neutral-800 dark:text-white text-2xl mt-6 mb-2">
            Clasificación
          </h1>
          <p className="text-muted-foreground text-center text-md mb-6">
            Compite con la comunidad. ¡Llega a la cima del podio!
          </p>
          
          <LeaderboardClient 
            allTimeData={leaderboardAllTime} 
            weeklyData={leaderboardWeekly} 
            currentUserId={userId} 
          />
        </div>
      </FeedWrapper>
    </div>
  );
};
 
export default LearderboardPage;
