"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { POINTS_TO_REFILL, MAX_HEARTS } from "@/constants";
import { getCourseById, getUserProgress, getUserSubscription } from "@/db/queries";

export const upsertUserProgress = async (courseId: number) => {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const course = await getCourseById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.units.length || !course.units[0].lessons.length) {
    return { error: "empty" };
  }

  await prisma.userProgress.upsert({
    where: { userId },
    update: {
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
    },
    create: {
      userId,
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
    },
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

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

  if (isPractice) {
    return { error: "practice" };
  }

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (userSubscription?.isActive) {
    return { error: "subscription" };
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await prisma.userProgress.update({
    where: { userId },
    data: { hearts: Math.max(currentUserProgress.hearts - 1, 0) },
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.hearts === MAX_HEARTS) {
    throw new Error("Hearts are already full");
  }

  if (currentUserProgress.points < POINTS_TO_REFILL) {
    throw new Error("Not enough points");
  }

  await prisma.userProgress.update({
    where: { userId: currentUserProgress.userId },
    data: {
      hearts: MAX_HEARTS,
      points: currentUserProgress.points - POINTS_TO_REFILL,
    },
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};

export const deductPointsForTutor = async (pointsToDeduct: number) => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    return { error: "User progress not found" };
  }

  if (currentUserProgress.points < pointsToDeduct) {
    return { error: "Not enough points" };
  }

  await prisma.userProgress.update({
    where: { userId: currentUserProgress.userId },
    data: { points: currentUserProgress.points - pointsToDeduct },
  });

  revalidatePath("/tutor");
  return { success: true };
};
