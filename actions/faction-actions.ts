"use server";

import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const joinFaction = async (factionId: number) => {
  const { userId } = auth();
  if (!userId) return { error: "No autorizado" };

  try {
    await prisma.userProgress.update({
      where: { userId },
      data: { factionId },
    });
    
    revalidatePath("/factions");
    revalidatePath("/learn");
    return { success: true };
  } catch (error) {
    return { error: "Error al unirse a la facción" };
  }
};

export const getFactionsLeaderboard = async () => {
  const factions = await prisma.faction.findMany({
    orderBy: { totalXp: "desc" },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });
  return factions;
};

// --- ADMIN ACTIONS ---

export const createFaction = async (data: { name: string; description: string; logoSrc: string }) => {
  const adminId = process.env.ADMIN_USER_ID;
  const { userId } = auth();
  if (userId !== adminId) return { error: "No autorizado" };

  try {
    await prisma.faction.create({ data });
    revalidatePath("/admin/factions");
    revalidatePath("/factions");
    return { success: true };
  } catch (error) {
    return { error: "Error al crear la facción (El nombre podría estar duplicado)" };
  }
};

export const updateFaction = async (id: number, data: { name: string; description: string; logoSrc: string }) => {
  const adminId = process.env.ADMIN_USER_ID;
  const { userId } = auth();
  if (userId !== adminId) return { error: "No autorizado" };

  try {
    await prisma.faction.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/factions");
    revalidatePath("/factions");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar la facción" };
  }
};

export const deleteFaction = async (id: number) => {
  const adminId = process.env.ADMIN_USER_ID;
  const { userId } = auth();
  if (userId !== adminId) return { error: "No autorizado" };

  try {
    await prisma.faction.delete({ where: { id } });
    revalidatePath("/admin/factions");
    revalidatePath("/factions");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar la facción (Asegúrate de que no tenga miembros inscritos)" };
  }
};
