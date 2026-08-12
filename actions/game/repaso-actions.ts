"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { incrementFactionXp } from "@/lib/faction-xp";
import { revalidatePath } from "next/cache";

/**
 * Agrega los puntos de XP acumulados durante la sesión de Repaso Rápido
 * de forma atómica y actualiza la facción correspondiente.
 */
export async function addRepasoXp(amount: number) {
  const { userId } = auth();
  if (!userId || amount <= 0) return { error: "No autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userProgress.update({
        where: { userId },
        data: {
          points: { increment: amount },
          weeklyPoints: { increment: amount },
        },
      });
      await incrementFactionXp(tx, userId, amount);
    });

    revalidatePath("/learn");
    return { success: true };
  } catch (e) {
    console.error("[ADD_REPASO_XP_ERROR]", e);
    return { error: "Error al guardar el XP obtenido." };
  }
}
