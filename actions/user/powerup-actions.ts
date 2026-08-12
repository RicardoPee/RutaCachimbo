"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getMascotSkinById, getPowerupCardById } from "@/lib/powerups-catalog";

export const buyPowerupCard = async (
  cardId: "fiftyFifty" | "aiHint" | "heartShield", 
  isPack: boolean = false
) => {
  const { userId } = auth();
  if (!userId) throw new Error("No autorizado");

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Usuario no encontrado");

  const cardDef = getPowerupCardById(cardId);
  if (!cardDef) throw new Error("Carta no encontrada");

  const cost = isPack ? cardDef.packPrice : cardDef.singlePrice;
  const quantity = isPack ? cardDef.packQuantity : 1;

  if (progress.points < cost) {
    throw new Error("No tienes suficientes puntos para esta compra.");
  }

  const updateField = 
    cardId === "fiftyFifty" ? "cardFiftyFifty" :
    cardId === "aiHint" ? "cardAiHint" : "cardHeartShield";

  const currentCount = (progress[updateField] as number) || 0;

  await prisma.userProgress.update({
    where: { userId },
    data: {
      points: progress.points - cost,
      [updateField]: currentCount + quantity,
    }
  });

  revalidatePath("/shop");
  revalidatePath("/lesson");
  return { success: true, newCount: currentCount + quantity };
};

export const consumePowerupCard = async (
  cardId: "fiftyFifty" | "aiHint" | "heartShield"
) => {
  const { userId } = auth();
  if (!userId) throw new Error("No autorizado");

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Usuario no encontrado");

  const updateField = 
    cardId === "fiftyFifty" ? "cardFiftyFifty" :
    cardId === "aiHint" ? "cardAiHint" : "cardHeartShield";

  const currentCount = (progress[updateField] as number) || 0;

  if (currentCount <= 0) {
    throw new Error("No posees unidades de esta carta. ¡Cómpralas en la Tienda!");
  }

  await prisma.userProgress.update({
    where: { userId },
    data: {
      [updateField]: Math.max(0, currentCount - 1),
    }
  });

  revalidatePath("/shop");
  revalidatePath("/lesson");
  return { success: true, remaining: currentCount - 1 };
};

export const buyMascotSkin = async (skinId: string) => {
  const { userId } = auth();
  if (!userId) throw new Error("No autorizado");

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Usuario no encontrado");

  const skinDef = getMascotSkinById(skinId);
  if (!skinDef) throw new Error("Skin no encontrada");

  if (progress.ownedMascotSkins?.includes(skinId)) {
    throw new Error("Ya posees esta apariencia");
  }

  if (progress.points < skinDef.price) {
    throw new Error("No tienes suficientes puntos para desbloquear esta apariencia");
  }

  const owned = progress.ownedMascotSkins || ["default"];

  await prisma.userProgress.update({
    where: { userId },
    data: {
      points: progress.points - skinDef.price,
      ownedMascotSkins: [...owned, skinId],
      activeMascotSkin: skinId, // Auto equip
    }
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/lesson");
  return { success: true };
};

export const equipMascotSkin = async (skinId: string) => {
  const { userId } = auth();
  if (!userId) throw new Error("No autorizado");

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  if (!progress) throw new Error("Usuario no encontrado");

  const owned = progress.ownedMascotSkins || ["default"];
  if (!owned.includes(skinId) && skinId !== "default") {
    throw new Error("No posees esta apariencia para la mascota");
  }

  await prisma.userProgress.update({
    where: { userId },
    data: {
      activeMascotSkin: skinId,
    }
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/lesson");
  return { success: true };
};
