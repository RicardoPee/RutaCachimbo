"use server";

import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

    // RNG Logic based on chest type
    let rewardValue = "";
    let rewardType = "BORDER"; // Currently drops borders
    const rand = Math.random();

    if (chest.type === "COMUN") {
      rewardValue = rand > 0.5 ? "border-slate-400" : "border-stone-500";
    } else if (chest.type === "RARO") {
      rewardValue = rand > 0.5 ? "border-blue-500" : "border-purple-500";
    } else if (chest.type === "EPICO") {
      rewardValue = rand > 0.7 ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]" : "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
    }

    // Unlock reward
    await prisma.$transaction(async (tx) => {
      await tx.userChest.update({
        where: { id: chestId },
        data: { opened: true, rewardType, rewardValue }
      });
      
      const user = await tx.userProgress.findUnique({ where: { userId } });
      if (user && !user.ownedBorders.includes(rewardValue)) {
         await tx.userProgress.update({
           where: { userId },
           data: { ownedBorders: { push: rewardValue } }
         });
      }
    });

    revalidatePath("/shop");
    return { success: true, rewardValue, rewardType };
  } catch (error) {
    return { error: "Error al abrir el cofre" };
  }
};
