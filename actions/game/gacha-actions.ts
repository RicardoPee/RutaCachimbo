"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRandomBorderByRarity, getBorderById } from "@/lib/shop-catalog";

const CHEST_PRICES = {
  COMUN: 50,
  RARO: 150,
  EPICO: 300,
};

export const buyChest = async (type: "COMUN" | "RARO" | "EPICO") => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const user = await prisma.userProgress.findUnique({ where: { userId } });
    if (!user) return { error: "Usuario no encontrado" };

    const price = CHEST_PRICES[type];
    if (user.points < price) return { error: "Puntos insuficientes" };

    // Deduce points and create chest
    const [_, chest] = await prisma.$transaction([
      prisma.userProgress.update({
        where: { userId },
        data: { points: { decrement: price } }
      }),
      prisma.userChest.create({
        data: {
          userId,
          type
        }
      })
    ]);

    revalidatePath("/shop");
    return { success: true, chestId: chest.id };
  } catch (error) {
    return { error: "Error al comprar el cofre" };
  }
};

export const openChest = async (chestId: number) => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const chest = await prisma.userChest.findUnique({ where: { id: chestId } });
    if (!chest || chest.userId !== userId || chest.opened) {
      return { error: "Cofre inválido o ya abierto" };
    }

    // Get catalog border reward by rarity
    const borderReward = getRandomBorderByRarity(chest.type);
    const rewardValue = borderReward.id; // Store clean ID
    const rewardType = "BORDER";

    // Unlock reward
    await prisma.$transaction(async (tx) => {
      await tx.userChest.update({
        where: { id: chestId },
        data: { opened: true, rewardType, rewardValue }
      });
      
      const user = await tx.userProgress.findUnique({ where: { userId } });
      if (user) {
        const owned = user.ownedBorders || [];
        if (!owned.includes(rewardValue)) {
          await tx.userProgress.update({
            where: { userId },
            data: { 
              ownedBorders: { push: rewardValue },
              activeBorder: rewardValue // Auto-equip reward on unlock
            }
          });
        } else {
          // Auto equip if already owned
          await tx.userProgress.update({
            where: { userId },
            data: { activeBorder: rewardValue }
          });
        }
      }
    });

    revalidatePath("/shop");
    revalidatePath("/leaderboard");

    return { 
      success: true, 
      rewardValue, 
      rewardName: borderReward.name,
      rewardRarity: borderReward.rarity,
      rewardStyle: borderReward.borderStyle,
      rewardType 
    };
  } catch (error) {
    return { error: "Error al abrir el cofre" };
  }
};
