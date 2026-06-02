import { redirect } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { Promo } from "@/components/promo";
import { RadarChartClient } from "./radar-chart-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

const AnalyticsPage = async () => {
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

  const { userId } = auth();
  const examHistoryCount = await prisma.mockExamResult.count({
    where: { userId: userId || "" }
  });

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
        <div className="w-full pb-10">
          <RadarChartClient hasHistory={examHistoryCount > 0} />
        </div>
      </FeedWrapper>
    </div>
  );
};
 
export default AnalyticsPage;
