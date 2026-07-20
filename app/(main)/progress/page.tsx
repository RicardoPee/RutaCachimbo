import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { 
  getUserProgress, 
  getUserSubscription, 
  getCompletedChallengesCount, 
  getTopTenUsers,
  getDynamicQuests
} from "@/db/queries";
import { getUserAchievements } from "@/actions/achievement-actions";
import { ProgressClient } from "./progress-client";

const ProgressPage = async () => {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/");
  }

  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const completedChallengesData = getCompletedChallengesCount();
  const topWeeklyUsersData = getTopTenUsers("WEEKLY");
  const achievementsData = getUserAchievements();
  const dynamicQuestsData = getDynamicQuests();

  const [
    userProgress,
    userSubscription,
    completedChallengesCount,
    topWeeklyUsers,
    achievements,
    dynamicQuests,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    completedChallengesData,
    topWeeklyUsersData,
    achievementsData,
    dynamicQuestsData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  // Find user's weekly rank
  const userIndex = topWeeklyUsers.findIndex(u => u.userId === userProgress.userId);
  const weeklyRank = userIndex !== -1 ? userIndex + 1 : null;

  return (
    <ProgressClient
      userProgress={userProgress}
      isPro={isPro}
      completedChallengesCount={completedChallengesCount}
      weeklyRank={weeklyRank}
      achievements={achievements}
      dynamicQuests={dynamicQuests}
    />
  );
};

export default ProgressPage;
