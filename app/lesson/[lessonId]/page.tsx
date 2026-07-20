import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";

import { Quiz } from "../quiz";

type Props = {
  params: {
    lessonId: number | string;
  };
};

const LessonIdPage = async ({
  params,
}: Props) => {
  const parsedId = Number(params.lessonId);
  const lessonData = getLesson(isNaN(parsedId) ? undefined : parsedId);
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const [
    lesson,
    userProgress,
    userSubscription,
  ] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  const initialPercentage = lesson.challenges.length === 0
    ? 0
    : lesson.challenges
      .filter((challenge) => challenge.completed)
      .length / lesson.challenges.length * 100;

  return ( 
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
      referenceText={lesson.referenceText}
      isAdmin={isAdmin()}
      userProgress={userProgress}
    />
  );
};
 
export default LessonIdPage;
