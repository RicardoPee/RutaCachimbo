"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ALL_ACHIEVEMENTS, Achievement } from "@/lib/achievements";

export type UserAchievementStatus = Achievement & {
  unlocked: boolean;
};

/**
 * Retorna todos los logros del sistema indicando cuáles han sido desbloqueados por el usuario actual.
 */
export const getUserAchievements = async (): Promise<UserAchievementStatus[]> => {
  const { userId } = auth();
  if (!userId) return [];

  const progress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  const unlockedSet = new Set(progress?.unlockedAchievements || []);

  return ALL_ACHIEVEMENTS.map((ach) => ({
    ...ach,
    unlocked: unlockedSet.has(ach.id),
  }));
};
