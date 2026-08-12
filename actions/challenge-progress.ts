"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { calculateNewStreak } from "@/lib/streak";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { POINTS_PER_CHALLENGE, MAX_HEARTS } from "@/constants";
import { incrementFactionXp } from "@/lib/faction-xp";

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

  let pointsEarned = POINTS_PER_CHALLENGE;
  if (newStreak > 1) {
    pointsEarned += newStreak * 2; // Racha bonus: streak * 2
  }

  const isXpBoosted = currentUserProgress.xpBoosterEndsAt && new Date(currentUserProgress.xpBoosterEndsAt) > new Date();
  if (isXpBoosted) {
    pointsEarned *= 2; // Poción Doble XP
  }

  const progressUpdate = {
    points: currentUserProgress.points + pointsEarned,
    weeklyPoints: currentUserProgress.weeklyPoints + pointsEarned,
    streak: newStreak,
    lastActive: newLastActive,
    ...(usedFreeze ? { streakFreeze: false } : {}),
  };

  if (isPractice) {
    await prisma.$transaction(async (tx) => {
      await tx.challengeProgress.update({
        where: { id: existingChallengeProgress.id },
        data: { completed: true },
      });
      await tx.userProgress.update({
        where: { userId },
        data: {
          ...progressUpdate,
          hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
        },
      });
      await incrementFactionXp(tx, userId, pointsEarned);
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.challengeProgress.create({
        data: { challengeId, userId, completed: true },
      });
      await tx.userProgress.update({
        where: { userId },
        data: progressUpdate,
      });
      await incrementFactionXp(tx, userId, pointsEarned);
    });
  }

  // Verificar logros desbloqueados
  const newlyUnlocked = await checkAndUnlockAchievements(userId, {
    type: "challenge",
    streakValue: newStreak
  });

  if (newlyUnlocked.length > 0) {
    // Si hay logros desbloqueados, informamos al cliente de forma amigable
    return { success: true, newlyUnlocked };
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
