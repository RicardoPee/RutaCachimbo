import { redirect } from "next/navigation";
import Image from "next/image";

import { Promo } from "@/components/study/promo";
import { Quests } from "@/components/study/quests";
import { FeedWrapper } from "@/components/layout/feed-wrapper";
import { UserProgress } from "@/components/study/user-progress";
import { StickyWrapper } from "@/components/layout/sticky-wrapper";
import { DidYouKnow } from "@/components/study/did-you-know";
import { DailyChallenge } from "@/components/study/daily-challenge";
import { ReviewSidebarCard } from "@/components/study/review-sidebar-card";
import type { Lesson, Unit as UnitModel } from "@prisma/client";
import { 
  getCourseProgress, 
  getLessonPercentage, 
  getUnits, 
  getUserProgress,
  getUserSubscription,
  getDynamicQuests
} from "@/db/queries";

import { Unit } from "./unit";
import { Header } from "./header";
import { TournamentBanner } from "./tournament-banner";

const LearnPage = async () => {
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();
  const userSubscriptionData = getUserSubscription();
  const dynamicQuestsData = getDynamicQuests();

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
    dynamicQuests,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    courseProgressData,
    lessonPercentageData,
    userSubscriptionData,
    dynamicQuestsData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  if (!courseProgress) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-6 lg:gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
          streak={userProgress.streak ?? 0}
        />
        {!isPro && (
          <Promo />
        )}
        <DailyChallenge />
        <ReviewSidebarCard />
        <Quests quests={dynamicQuests} />
        <DidYouKnow />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        <TournamentBanner />
        {units.map((unit) => (
          <div key={unit.id} className="mb-16">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson as Lesson & {
                unit: UnitModel;
              } | undefined}
              activeLessonPercentage={lessonPercentage}
            />
          </div>
        ))}
        
        {/* Placeholder Final de Mapa */}
        <div className="w-full flex flex-col items-center justify-center p-10 pb-20 opacity-60">
          <Image src="/mascot.svg" height={80} width={80} alt="Fin de las lecturas" className="grayscale mb-4" />
          <p className="text-neutral-400 font-bold text-center text-sm max-w-[200px]">
            ¡Más lecturas próximamente! Dile a tu profesor que suba un nuevo PDF.
          </p>
        </div>
      </FeedWrapper>
    </div>
  );
};
 
export default LearnPage;
