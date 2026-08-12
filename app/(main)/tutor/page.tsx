import { redirect } from "next/navigation";
import { getUserProgress, getUserSubscription, getDynamicQuests } from "@/db/queries";
import { FeedWrapper } from "@/components/layout/feed-wrapper";
import { UserProgress } from "@/components/study/user-progress";
import { StickyWrapper } from "@/components/layout/sticky-wrapper";
import { Promo } from "@/components/study/promo";
import { Quests } from "@/components/study/quests";
import { TutorChatClient } from "./tutor-chat-client";

const TutorPage = async () => {
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

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 h-full pb-10">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
          streak={userProgress.streak}
        />
        {!isPro && <Promo />}
        <Quests quests={dynamicQuests} />
      </StickyWrapper>
      <FeedWrapper>
        <TutorChatClient league={userProgress.league} points={userProgress.points} />
      </FeedWrapper>
    </div>
  );
};

export default TutorPage;
