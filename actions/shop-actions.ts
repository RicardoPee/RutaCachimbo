"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const buyStreakFreeze = async () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  
  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Progress not found");

  const COST = 200;
  if (progress.points < COST) throw new Error("Not enough points");
  if (progress.streakFreeze) throw new Error("Ya tienes un congelador activo");

  await prisma.userProgress.update({
    where: { userId },
    data: {
      points: progress.points - COST,
      streakFreeze: true,
    }
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
};

export const buyXpBooster = async () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Progress not found");

  const COST = 500;
  if (progress.points < COST) throw new Error("Not enough points");

  const endsAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.userProgress.update({
    where: { userId },
    data: {
      points: progress.points - COST,
      xpBoosterEndsAt: endsAt,
    }
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
};

export const buyBorder = async (borderName: string, cost: number) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Progress not found");

  if (progress.points < cost) throw new Error("Not enough points");
  if (progress.ownedBorders?.includes(borderName)) throw new Error("Ya tienes este borde");

  const newBorders = [...(progress.ownedBorders || []), borderName];

  await prisma.userProgress.update({
    where: { userId },
    data: {
      points: progress.points - cost,
      ownedBorders: newBorders,
      activeBorder: borderName, // Equip on buy
    }
  });

  revalidatePath("/shop");
  revalidatePath("/leaderboard");
};

export const equipBorder = async (borderName: string) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Progress not found");

  if (!progress.ownedBorders?.includes(borderName) && borderName !== "default" && borderName !== "") {
    throw new Error("No posees este borde");
  }

  await prisma.userProgress.update({
    where: { userId },
    data: {
      activeBorder: borderName === "default" ? null : borderName,
    }
  });

  revalidatePath("/shop");
  revalidatePath("/leaderboard");
};
