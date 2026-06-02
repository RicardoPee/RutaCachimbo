import { redirect } from "next/navigation";
import { getUserProgress } from "@/db/queries";
import { PvpLobbyClient } from "./pvp-lobby-client";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";

export default async function PvpPage() {
  const userProgressData = getUserProgress();
  const [userProgress] = await Promise.all([userProgressData]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
          streak={userProgress.streak}
        />
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center gap-8">
          <PvpLobbyClient />
        </div>
      </FeedWrapper>
    </div>
  );
}
