"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { calculateNewStreak } from "@/lib/streak";
import { POINTS_PER_CHALLENGE, MAX_HEARTS } from "@/constants";

export const upsertChallengeProgress = async (challengeId: number) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await prisma.challengeProgress.findFirst({
    where: { userId, challengeId },
  });

  const isPractice = !!existingChallengeProgress;

  if (
    currentUserProgress.hearts === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  ) {
    return { error: "hearts" };
  }

  const { newStreak, usedFreeze, newLastActive } = calculateNewStreak(
    currentUserProgress.streak,
    currentUserProgress.lastActive,
    currentUserProgress.streakFreeze
  );

  const progressUpdate = {
    points: currentUserProgress.points + POINTS_PER_CHALLENGE,
    weeklyPoints: currentUserProgress.weeklyPoints + POINTS_PER_CHALLENGE,
    streak: newStreak,
    lastActive: newLastActive,
    ...(usedFreeze ? { streakFreeze: false } : {}),
  };

  if (isPractice) {
    await prisma.$transaction([
      prisma.challengeProgress.update({
        where: { id: existingChallengeProgress.id },
        data: { completed: true },
      }),
      prisma.userProgress.update({
        where: { userId },
        data: {
          ...progressUpdate,
          hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.challengeProgress.create({
        data: { challengeId, userId, completed: true },
      }),
      prisma.userProgress.update({
        where: { userId },
        data: progressUpdate,
      }),
    ]);
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
