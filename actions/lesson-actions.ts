"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isAdminId } from "@/lib/admin";

export async function upsertLesson(data: { id?: number; title: string; unitId: number; order: number; referenceText?: string | null }) {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    throw new Error("Unauthorized");
  }

  try {
    if (data.id) {
      const updated = await prisma.lesson.update({
        where: { id: data.id },
        data: { 
          title: data.title, 
          unitId: data.unitId, 
          order: data.order,
          referenceText: data.referenceText || null
        },
      });
      revalidatePath("/admin/lessons");
      revalidatePath("/learn");
      return updated;
    } else {
      const created = await prisma.lesson.create({
        data: { 
          title: data.title, 
          unitId: data.unitId, 
          order: data.order,
          referenceText: data.referenceText || null
        },
      });
      revalidatePath("/admin/lessons");
      revalidatePath("/learn");
      return created;
    }
  } catch (error) {
    throw new Error("Failed to save lesson");
  }
}

export async function deleteLesson(id: number) {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.lesson.delete({
      where: { id },
    });
    revalidatePath("/admin/lessons");
    revalidatePath("/learn");
  } catch (error) {
    throw new Error("Failed to delete lesson");
  }
}
